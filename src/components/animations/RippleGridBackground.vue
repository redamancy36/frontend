<template>
  <div ref="containerRef" :class="['ripple-grid-background', className]"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Renderer, Program, Triangle, Mesh } from 'ogl'

const props = defineProps({
  gridColor: {
    type: String,
    default: '#667eea'
  },
  rippleIntensity: {
    type: Number,
    default: 0.08
  },
  gridSize: {
    type: Number,
    default: 12.0
  },
  gridThickness: {
    type: Number,
    default: 12.0
  },
  glowIntensity: {
    type: Number,
    default: 0.2
  },
  opacity: {
    type: Number,
    default: 0.6
  },
  mouseInteraction: {
    type: Boolean,
    default: true
  },
  mouseInteractionRadius: {
    type: Number,
    default: 1.0
  },
  className: {
    type: String,
    default: ''
  }
})

const containerRef = ref(null)
let renderer = null
let program = null
let mesh = null
let animationId = null
let uniforms = null
const mousePosition = ref({ x: 0.5, y: 0.5 })
const targetMouse = ref({ x: 0.5, y: 0.5 })
const mouseInfluence = ref(0)

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [1, 1, 1]
}

const handleMouseMove = (e) => {
  if (!props.mouseInteraction) return
  const container = containerRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  targetMouse.value = {
    x: (e.clientX - rect.left) / rect.width,
    y: 1.0 - (e.clientY - rect.top) / rect.height
  }
  mouseInfluence.value = 1.0
}

const handleMouseEnter = () => {
  if (!props.mouseInteraction) return
  mouseInfluence.value = 1.0
}

const handleMouseLeave = () => {
  if (!props.mouseInteraction) return
  mouseInfluence.value = 0.0
}

const initRippleGrid = () => {
  const container = containerRef.value
  if (!container) return

  try {
    renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true
    })
    const gl = renderer.gl
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.position = 'absolute'
    gl.canvas.style.top = '0'
    gl.canvas.style.left = '0'
    container.appendChild(gl.canvas)

    const vert = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const frag = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 gridColor;
      uniform float rippleIntensity;
      uniform float gridSize;
      uniform float gridThickness;
      uniform float glowIntensity;
      uniform float opacity;
      uniform bool mouseInteraction;
      uniform vec2 mousePosition;
      uniform float mouseInfluence;
      uniform float mouseInteractionRadius;
      varying vec2 vUv;

      float pi = 3.141592;

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= iResolution.x / iResolution.y;

        float dist = length(uv);
        float func = sin(pi * (iTime - dist));
        vec2 rippleUv = uv + uv * func * rippleIntensity;

        if (mouseInteraction && mouseInfluence > 0.0) {
          vec2 mouseUv = (mousePosition * 2.0 - 1.0);
          mouseUv.x *= iResolution.x / iResolution.y;
          float mouseDist = length(uv - mouseUv);

          float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));

          float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
          rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
        }

        vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
        vec2 b = abs(a);

        float aaWidth = 0.5;
        vec2 smoothB = vec2(
          smoothstep(0.0, aaWidth, b.x),
          smoothstep(0.0, aaWidth, b.y)
        );

        vec3 color = vec3(0.0);
        color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
        color += exp(-gridThickness * smoothB.y);
        color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
        color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

        if (glowIntensity > 0.0) {
          color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
          color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
        }

        float ddd = exp(-2.0 * clamp(pow(dist, 1.5), 0.0, 1.0));

        vec2 vignetteCoords = vUv - 0.5;
        float vignetteDistance = length(vignetteCoords);
        float vignette = 1.0 - pow(vignetteDistance * 2.0, 2.0);
        vignette = clamp(vignette, 0.0, 1.0);

        float finalFade = ddd * vignette;
        float alpha = length(color) * finalFade * opacity;
        gl_FragColor = vec4(color * gridColor * finalFade * opacity, alpha);
      }
    `

    const geometry = new Triangle(gl)
    uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [window.innerWidth, window.innerHeight] },
      gridColor: { value: hexToRgb(props.gridColor) },
      rippleIntensity: { value: props.rippleIntensity },
      gridSize: { value: props.gridSize },
      gridThickness: { value: props.gridThickness },
      glowIntensity: { value: props.glowIntensity },
      opacity: { value: props.opacity },
      mouseInteraction: { value: props.mouseInteraction },
      mousePosition: { value: [0.5, 0.5] },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: props.mouseInteractionRadius }
    }

    program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms
    })

    mesh = new Mesh(gl, { geometry, program })
    
    const resize = () => {
      if (!container) return
      const width = container.offsetWidth || window.innerWidth
      const height = container.offsetHeight || window.innerHeight
      renderer.setSize(width, height)
      if (uniforms) {
        uniforms.iResolution.value = [width, height]
      }
    }

    window.addEventListener('resize', resize)
    if (props.mouseInteraction) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    resize()

    const render = (t) => {
      animationId = requestAnimationFrame(render)
      
      if (uniforms) {
        uniforms.iTime.value = t * 0.001
        
        // 平滑鼠标位置
        mousePosition.value.x += (targetMouse.value.x - mousePosition.value.x) * 0.1
        mousePosition.value.y += (targetMouse.value.y - mousePosition.value.y) * 0.1
        
        // 平滑鼠标影响
        const currentInfluence = uniforms.mouseInfluence.value
        const targetInfluence = mouseInfluence.value
        uniforms.mouseInfluence.value += (targetInfluence - currentInfluence) * 0.05
        
        uniforms.mousePosition.value = [mousePosition.value.x, mousePosition.value.y]
        
        renderer.render({ scene: mesh })
      }
    }

    animationId = requestAnimationFrame(render)

    console.log('[RippleGrid] Initialized successfully')
  } catch (error) {
    console.error('[RippleGrid] Initialization failed:', error)
  }
}

const cleanup = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (renderer) {
    const gl = renderer.gl
    const container = containerRef.value
    if (container && gl.canvas.parentNode === container) {
      container.removeChild(gl.canvas)
    }
    if (props.mouseInteraction && container) {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
  renderer = null
  program = null
  mesh = null
  uniforms = null
}

onMounted(() => {
  setTimeout(() => {
    initRippleGrid()
  }, 100)
})

onUnmounted(() => {
  cleanup()
})

watch(
  () => [props.gridColor, props.rippleIntensity, props.gridSize, props.opacity, props.glowIntensity],
  () => {
    if (uniforms) {
      uniforms.gridColor.value = hexToRgb(props.gridColor)
      uniforms.rippleIntensity.value = props.rippleIntensity
      uniforms.gridSize.value = props.gridSize
      uniforms.gridThickness.value = props.gridThickness
      uniforms.glowIntensity.value = props.glowIntensity
      uniforms.opacity.value = props.opacity
    }
  },
  { deep: true }
)
</script>

<style scoped>
.ripple-grid-background {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 0 !important;
  pointer-events: auto;
  overflow: hidden;
  will-change: transform;
}
</style>

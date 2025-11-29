<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container" style="height: 700px; overflow: hidden; position: relative">
        <ProfileCard
          :key="rerenderKey"
          name="Javi A. Torres"
          title="Software Engineer"
          handle="javicodes"
          status="Online"
          contact-text="Contact Me"
          avatar-url="/assets/person.png"
          :icon-url="showIcon ? '/assets/iconpattern.png' : ''"
          :show-user-info="showUserInfo"
          :show-behind-gradient="showBehindGradient"
          grain-url="/assets/grain.webp"
          :behind-gradient="customBehindGradient"
          :inner-gradient="customInnerGradient"
          @contact-click="handleContactClick"
        />
      </div>

      <Customize>
        <button @click="generateRandomGradients" class="randomize-btn">Randomize Colors</button>

        <PreviewSwitch title="Show Icon Pattern" v-model="showIcon" />

        <PreviewSwitch title="Show User Info" v-model="showUserInfo" />

        <PreviewSwitch title="Show BG Gradient" v-model="showBehindGradient" />
      </Customize>

      <PropTable :data="propData" />
    </template>

    <template #code>
      <CodeExample :code-object="profileCard" />
    </template>

    <template #cli>
      <CliInstallation :command="profileCard.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import PropTable from '../../components/common/PropTable.vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Customize from '../../components/common/Customize.vue';
import PreviewSwitch from '../../components/common/PreviewSwitch.vue';
import ProfileCard from '../../content/Components/ProfileCard/ProfileCard.vue';
import { profileCard } from '@/constants/code/Components/profileCardCode';
import { useToast } from 'primevue/usetoast';
import { useForceRerender } from '@/composables/useForceRerender';

const showIcon = ref(true);
const showUserInfo = ref(true);
const showBehindGradient = ref(true);
const customBehindGradient = ref(
  'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)'
);
const customInnerGradient = ref('linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)');

const toast = useToast();
const { rerenderKey, forceRerender } = useForceRerender();

const generateRandomGradients = () => {
  const randomHue1 = Math.floor(Math.random() * 360);
  const randomHue2 = Math.floor(Math.random() * 360);
  const randomHue3 = Math.floor(Math.random() * 360);
  const randomHue4 = Math.floor(Math.random() * 360);

  const newBehindGradient = `radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(${randomHue1},100%,90%,var(--card-opacity)) 4%,hsla(${randomHue1},50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(${randomHue1},25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(${randomHue1},0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,hsl(${randomHue2}, 100%, 70%) 0%,transparent 100%),radial-gradient(100% 100% at 50% 50%,hsl(${randomHue3}, 100%, 65%) 1%,transparent 76%),conic-gradient(from 124deg at 50% 50%,hsl(${randomHue4}, 100%, 70%) 0%,hsl(${randomHue2}, 100%, 70%) 40%,hsl(${randomHue2}, 100%, 70%) 60%,hsl(${randomHue4}, 100%, 70%) 100%)`;
  const newInnerGradient = `linear-gradient(145deg,hsla(${randomHue1}, 40%, 45%, 0.55) 0%,hsla(${randomHue3}, 60%, 70%, 0.27) 100%)`;

  customBehindGradient.value = newBehindGradient;
  customInnerGradient.value = newInnerGradient;
  forceRerender();
};

const handleContactClick = () => {
  toast.add({
    severity: 'info',
    summary: 'Contact Clicked!',
    detail: 'Contact button was clicked',
    life: 3000
  });
};

const propData = [
  {
    name: 'avatarUrl',
    type: 'string',
    default: '"<Placeholder for avatar URL>"',
    description: 'URL for the main avatar image displayed on the card'
  },
  {
    name: 'iconUrl',
    type: 'string',
    default: '"<Placeholder for icon URL>"',
    description: 'Optional URL for an icon pattern overlay on the card background'
  },
  {
    name: 'grainUrl',
    type: 'string',
    default: '"<Placeholder for grain URL>"',
    description: 'Optional URL for a grain texture overlay effect'
  },
  {
    name: 'behindGradient',
    type: 'string',
    default: 'undefined',
    description: 'Custom CSS gradient string for the background gradient effect'
  },
  {
    name: 'innerGradient',
    type: 'string',
    default: 'undefined',
    description: 'Custom CSS gradient string for the inner card gradient'
  },
  {
    name: 'showBehindGradient',
    type: 'boolean',
    default: 'true',
    description: 'Whether to display the background gradient effect'
  },
  {
    name: 'className',
    type: 'string',
    default: '""',
    description: 'Additional CSS classes to apply to the card wrapper'
  },
  {
    name: 'enableTilt',
    type: 'boolean',
    default: 'true',
    description: 'Enable or disable the 3D tilt effect on mouse hover'
  },
  {
    name: 'miniAvatarUrl',
    type: 'string',
    default: 'undefined',
    description: 'Optional URL for a smaller avatar in the user info section'
  },
  {
    name: 'name',
    type: 'string',
    default: '"Javi A. Torres"',
    description: "User's display name"
  },
  {
    name: 'title',
    type: 'string',
    default: '"Software Engineer"',
    description: "User's job title or role"
  },
  {
    name: 'handle',
    type: 'string',
    default: '"javicodes"',
    description: "User's handle or username (displayed with @ prefix)"
  },
  {
    name: 'status',
    type: 'string',
    default: '"Online"',
    description: "User's current status"
  },
  {
    name: 'contactText',
    type: 'string',
    default: '"Contact"',
    description: 'Text displayed on the contact button'
  },
  {
    name: 'showUserInfo',
    type: 'boolean',
    default: 'true',
    description: 'Whether to display the user information section'
  },
  {
    name: 'onContactClick',
    type: 'function',
    default: 'undefined',
    description: 'Callback function called when the contact button is clicked'
  }
];
</script>

<style scoped>
.randomize-btn {
  font-size: 12px;
  background: #111;
  border-radius: 10px;
  border: 1px solid #333;
  color: #fff;
  height: 32px;
  padding: 0 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.randomize-btn:hover {
  background: #222;
}
</style>

export interface CodeObject {
  cli?: string;
  utility?: string;
  code?: string;
  usage?: string;
  installation?: string;
}

export interface CodeObjectInput {
  utility?: string;
  code?: string;
  usage?: string;
  installation?: string;
}

export function createCodeObject(code: string, path: string, data: CodeObjectInput): CodeObject {
  const [category, componentName] = path.split('/');
  return {
    cli: `npx jsrepo add https://vue-bits.dev/ui/${category}/${componentName}`,
    ...(data.installation && { installation: data.installation }),
    ...(data.usage && { usage: data.usage }),
    code,
    ...(data.utility && { utility: data.utility })
  };
}

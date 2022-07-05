import store from '@/store';

function checkPermission(el: HTMLElement, binding: any) {
  const { value } = binding;
  const roles = store.state && store.state.roles;

  if (value && value instanceof Array) {
    if (value.length > 0) {
      const permissionRoles = value;

      const hasPermission = roles.some((role: string) => {
        return permissionRoles.includes(role);
      });

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    }
  } else {
    throw new Error(`need roles! Like v-permission="['admin','editor']"`);
  }
}

export default {
  inserted(el: HTMLElement, binding: any) {
    checkPermission(el, binding);
  },
  update(el: HTMLElement, binding: any) {
    checkPermission(el, binding);
  },
};

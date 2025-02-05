import {
  createRouter,
  createWebHashHistory
} from "vue-router";
import home from "../views/home/index.vue";
import login from "../views/login/index.vue";
import Layout from "../layout/index.vue";

const routes = [{
    path: "/login",
    name: login,
    component: login,
  },
  {
    path: "/",
    component: Layout,
    name: "container",
    redirect: "home",
    meta: {
      requiresAuth: true, //有一些页面是否登录才能进去
      name: "首页",
    },
    children: [{
      path: "/home",
      name: "home",
      component: () => import("../views/home/index.vue"),
      meta: {
        requiresAuth: true, //有一些页面是否登录才能进去
        name: "首页",
      },
    }, ],
  },

  {
    path: "/system",
    name: "system",
    component: Layout,
    meta: {
      name: "系统管理",
    },
    children: [
      {
        path: "/caseStep",
        name: "caseStep",
        component: () => import("../views/system/CaseStep/index.vue"),
        meta: {
          requiresAuth: false, //有一些页面是否登录才能进去
          name: "用例步骤",
        },
      },

    ],
  },
  {
    path: "/ErrorMessage",
    name: "ErrorMessage",
    component: Layout,
    meta: {
      name: "异常页面",
    },
    children: [{
        path: "/404",
        name: "404",
        component: () => import("../views/ErrorMessage/404.vue"),
        meta: {
          requiresAuth: true, //有一些页面是否登录才能进去
          name: "404",
        },
      },
      {
        path: "/500",
        name: "500",
        component: () => import("../views/ErrorMessage/500.vue"),
        meta: {
          requiresAuth: true, //有一些页面是否登录才能进去
          name: "500",
        },
      },
    ],
  },

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
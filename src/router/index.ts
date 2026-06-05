import { createRouter, createWebHistory } from "vue-router";

import UploadView from "../views/UploadView.vue";

// ui url tester
import PracticeView from "../views/PracticeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "upload",
      component: UploadView
    },
    {
      path: "/practice",
      name: "practice",
      component: PracticeView
    }
  ]
});

export default router;

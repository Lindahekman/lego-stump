import { createRouter, createWebHistory } from 'vue-router'
import StoryView from '../views/StoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'story',
      component: StoryView
    },
    {
      path: '/remote',
      name: 'remote',
      component: () => import('../views/RemoteView.vue')
    },
    {
      path: '/direct-grid',
      name: 'directGrid',
      component: () => import('../views/DirectGridView.vue')
    },
    {
      path: '/ghost-grid',
      name: 'ghostGrid',
      component: () => import('../views/GhostGridView.vue')
    },
    {
      path: '/sequential-remote',
      name: 'sequentialRemote',
      component: () => import('../views/SequentialRemoteView.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router

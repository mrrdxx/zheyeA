<template>
 <div class="container">
  <GlobalHeader :user="currentUser" />
  <Loader v-if="isLoading" text="拼命加载中" background="rgba(0, 0, 0, 0.8)"></Loader>
  <!-- <Message  :message="error.message" type="error" v-if="error.status"></Message> -->
  <router-view></router-view>
  <footer class="text-center py-4 text-secondary bg-light mt-6">
  <small>
    <ul class="list-inline mb-0">
      <li class="list-inline-item">© 2020 者也专栏</li>
      <li class="list-inline-item">课程</li>
      <li class="list-inline-item">文档</li>
      <li class="list-inline-item">联系</li>
      <li class="list-inline-item">更多</li>
    </ul>
  </small>
</footer>
 </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import Loader from './components/Loader.vue'
import GlobalHeader from './components/GlobalHeader.vue'
import createMessage from './components/createMessage'
// import type { UserProps } from './types'
import { GlobalDataProps } from './store'
// import Home from './views/Home.vue'
// import Login from './views/Login.vue'

export default defineComponent({
  name: 'App',
  components: {
    GlobalHeader,
    Loader

  },
  setup () {
    const store = useStore<GlobalDataProps>()
    const currentUser = computed(() => store.state.user)
    const isLoading = computed(() => store.state.loading)

    const error = computed(() => store.state.error)
    // onMounted(() => {
    //   const message = createMessage('click here', 'success')
    //   setTimeout(() => {
    //     message.destroy()
    //   }, 2000)
    //   if (!currentUser.value.isLogin && token.value) {
    //     axios.defaults.headers.common.Authorization = `Bearer ${token.value}`
    //     store.dispatch('fetchCurrentUser')
    //   }
    // })
    // 必须要写成箭头函数，因为error.value.status是响应式对象
    watch(() => error.value.status, () => {
      const { status, message } = error.value
      if (status && message) {
        createMessage(message, 'error')
      }
    })
    return {
      currentUser,
      isLoading,

      error,
      createMessage
    }
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import axios from 'axios'
import store from './store'
import 'easymde/dist/easymde.min.css'
axios.defaults.baseURL = 'http://apis.imooc.com/api/'
axios.interceptors.request.use(config => {
  config.params = { ...config.params, icode: '11C721C22B8DD2DD' }
  if (config.data instanceof FormData) { config.data.append('icode', '11C721C22B8DD2DD') } else {
    config.data = { ...config.data, icode: '11C721C22B8DD2DD' }
  }
  return config
})
axios.interceptors.request.use(config => {
  store.commit('setLoading', true)
  store.commit('setError', {
    status: false,
    message: ''
  })
  // 在每次请求成功后，将错误状态重置为初始状态
  // 确保错误消息不会一直显示
  return config
})
axios.interceptors.response.use(config => {
  setTimeout(() => {
    store.commit('setLoading', false)
  }, 1000)
  return config
}, (e) => {
  const { error } = e.response.data
  store.commit('setError', {
    status: true,
    message: error
  })
  store.commit('setLoading', false)
  return Promise.reject(e)
})
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')

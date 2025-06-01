import { createStore, Commit } from 'vuex'
// import { testData, testPosts } from './testData's
import axios, { AxiosRequestConfig } from 'axios'
export interface ResponseType<P= { [key: string]: any } >{
  code:number;
  msg:string;
  data:P;
}
export interface ImageProps{
  _id?: string
  url?: string
  createdAt?: string
  fitUrl?: string
}
export interface UserProps {
  isLogin: boolean;
  nickName?: string;
  _id?: string;
  column?: string;
  email?: string;
  avatar?: ImageProps;
  description?: string;
}

export interface GlobalErrorProps {
  status: boolean;
  message?: string;
}
export interface ColumnProps {
  // id?:number
  _id?: string;// 这里是自己加的，如果传了testdata就有用
  title: string;
  avatar?: ImageProps;
  description: string;
}
export interface PostProps {
  _id?: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: ImageProps|string;
  createdAt?: string;
  column: string;
  author?: string|UserProps;
  isHTML?: boolean; // 新增这一行
}
interface ListProps<P> {
  [id: string]: P;
}
export interface GlobalDataProps {
  error: GlobalErrorProps;
  token: string;
  loading: boolean;
  columns: ListProps<ColumnProps>;
  posts: ListProps<PostProps>;
  user: UserProps;
}

const getAndCommit = async (url: string, commit: Commit, mutationName: string) => {
  const { data } = await axios.get(url)
  commit(mutationName, data)
  return data
}
const postAndCommit = async (url: string, commit: Commit, mutationName: string, payload: any) => {
  const { data } = await axios.post(url, payload)
  commit(mutationName, data)
  return data
}
const asyncAndCommit = async (url: string, commit: Commit, mutationName: string, config: AxiosRequestConfig = { method: 'get' }) => {
  const { data } = await axios(url, config)
  commit(mutationName, data)
  return data
}
const store = createStore<GlobalDataProps>({
  state: {
    error: {
      status: false
    },
    token: localStorage.getItem('token') || '',
    loading: false,
    columns: {},
    posts: {},
    user: {
      isLogin: false
    }
  },
  mutations: {
    createPost (state, newPost) {
      state.posts.push(newPost)
    },
    fetchColumns (state, rawData) {
      state.columns = rawData.data.list
      // console.log('更新后的数据:', state.columns)
    },
    fetchColumn (state, rawData) {
      state.columns = [rawData.data]
    },
    fetchPosts (state, rawData) {
      state.posts = rawData.data.list
    },
    fetchPost (state, rawData) {
      state.posts = [rawData.data]
    },
    deletePost (state, { data }) {
      state.posts = state.posts.filter(post => post._id !== data._id)
    },
    updatePost (state, { data }) {
      state.posts = state.posts.map(post => {
        if (post._id === data._id) {
          return data
        }
        return post
      })
    },
    fetchCurrentUser (state, rawData) {
      state.user = { isLogin: true, ...rawData.data }
    },
    setLoading (state, status) {
      state.loading = status
    },
    setError (state, e: GlobalErrorProps) {
      state.error = e
    },
    login (state, rawData) {
      const { token } = rawData.data
      state.token = token
      localStorage.setItem('token', token)
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },
    logout (state) {
      state.token = ''
      // state.user = { isLogin: false }
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    }
  },
  actions: {
    async fetchColumns ({ commit }) {
      return getAndCommit('/columns', commit, 'fetchColumns')
    },
    async fetchColumn ({ commit }, cid) {
      const { data } = await axios.get(`/columns/${cid}`)
      return commit('fetchColumn', data)
    },
    async fetchPosts ({ commit }, cid) {
      const { data } = await axios.get(`/columns/${cid}/posts`)
      return commit('fetchPosts', data)
    },
    fetchPost ({ commit }, id) {
      return getAndCommit(`/posts/${id}`, commit, 'fetchPost')
    },
    updatePost ({ commit }, { id, payload }) {
      return asyncAndCommit(`/posts/${id}`, commit, 'updatePost', {
        method: 'patch',
        data: payload
      })
    },
    login ({ commit }, payload) {
      return postAndCommit('/user/login', commit, 'login', payload)
    },
    fetchCurrentUser ({ commit }) {
      return getAndCommit('/user/current', commit, 'fetchCurrentUser')
    },
    createPost ({ commit }, payload) {
      return postAndCommit('/posts', commit, 'createPost', payload)
    },
    deletePost ({ commit }, id) {
      return asyncAndCommit(`/posts/${id}`, commit, 'deletePost', {
        method: 'delete'
      })
    },
    loginAndFetch ({ dispatch }, loginData) {
      return dispatch('login', loginData).then(() => {
        return dispatch('fetchCurrentUser')
      })
    }
    // 首先执行登录操作（dispatch('login', loginData)）
    // 登录成功后，立即获取当前用户信息（dispatch('fetchCurrentUser')）
  },
  getters: {
    getColumnById: (state) => (id: string) => {
      return state.columns.find(c => c._id === id)
    },
    getPostsByCid: (state) => (cid: string) => {
      return state.posts.filter(post => post.column === cid)
    },
    getCurrentPost: (state) => (id: string) => {
      return state.posts.find(post => post._id === id)
    }
  }
})

export default store

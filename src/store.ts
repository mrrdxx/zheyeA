import { createStore, Commit } from 'vuex'
// import { testData, testPosts } from './testData's
import axios, { AxiosRequestConfig } from 'axios'
import { arrToObj, objToArr } from './helper'
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
  // columns: ListProps<ColumnProps>;
  // posts: ListProps<PostProps>;
  columns: {
    data: ListProps<ColumnProps>;
    isLoaded: boolean;
    total: number;
  };
  posts: {
    data: ListProps<PostProps>;
    loadedColumns: string[];
  };
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
const asyncAndCommit = async (url: string, commit: Commit,
  mutationName: string,
  config: AxiosRequestConfig = { method: 'get' },
  extraData?: any
) => {
  const { data } = await axios(url, config)
  if (extraData) {
    commit(mutationName, { data, extraData })
  } else {
    commit(mutationName, data)
  }
  return data
}
const store = createStore<GlobalDataProps>({
  state: {
    token: localStorage.getItem('token') || '',
    error: { status: false },
    loading: false,
    // columns: { data: {}, isLoaded: false },
    // posts: { data: {}, loadedColumns: [] },
    columns: {
      data: {} as ListProps<ColumnProps>,
      isLoaded: false,
      total: 0
    },
    posts: {
      data: {} as ListProps<PostProps>,
      loadedColumns: []
    },
    user: { isLogin: false }
  },
  mutations: {
    createPost (state, newPost) {
      state.posts.data[newPost._id] = newPost
    },
    fetchColumns (state, rawData) {
      const { data } = state.columns
      const { list, count } = rawData.data
      state.columns = {
        data: { ...data, ...arrToObj(list) },
        isLoaded: true,
        total: count
      }
    },
    fetchColumn (state, rawData) {
      state.columns.data[rawData.data._id] = rawData.data
    },
    fetchPosts (state, { data: rawData, extraData: columnId }) {
      state.posts.data = { ...state.posts.data, ...arrToObj(rawData.data.list) }
      state.posts.loadedColumns.push(columnId)
    },
    fetchPost (state, rawData) {
      state.posts.data[rawData.data._id] = rawData.data
    },
    deletePost (state, { data }) {
      delete state.posts.data[data._id]
    },
    updatePost (state, { data }) {
      state.posts.data[data._id] = data
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
      state.user = { isLogin: false }
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    }
  },
  actions: {
    fetchColumns ({ state, commit }, params = {}) {
      const { currentPage = 1, pageSize = 6 } = params
      return asyncAndCommit(`/columns?currentPage=${currentPage}&pageSize=${pageSize}`, commit, 'fetchColumns')
    },
    fetchColumn ({ state, commit }, cid) {
      if (!state.columns.data[cid]) {
        return asyncAndCommit(`/columns/${cid}`, commit, 'fetchColumn')
      }
    },
    fetchPosts ({ state, commit }, cid) {
      if (!state.posts.loadedColumns.includes(cid)) {
        return asyncAndCommit(`/columns/${cid}/posts`, commit, 'fetchPosts', { method: 'get' }, cid)
      }
    },
    fetchPost ({ state, commit }, id) {
      const currentPost = state.posts.data[id]
      if (!currentPost || !currentPost.content) {
        return asyncAndCommit(`/posts/${id}`, commit, 'fetchPost')
      } else {
        return Promise.resolve({ data: currentPost })
      }
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
    getColumns: (state) => { return objToArr(state.columns.data) },
    getColumnById: (state) => (id: string) => {
      return state.columns.data[id]
    },
    getPostsByCid: (state) => (cid: string) => {
      return objToArr(state.posts.data).filter(post => post.column === cid)
    },
    getCurrentPost: (state) => (id: string) => {
      return state.posts.data[id]
    }
  }
})

export default store

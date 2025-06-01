<template>
  <div class="create-post-page text-start">
    <h4>{{isEditMode ? '编辑文章' : '新建文章'}}</h4>
    <Uploader action="/upload"
    :beforeUpload="uploadCheck"
    :uploaded="uploadedData"
    @file-uploaded="handleFileUploaded"
    class="d-flex align-items-center
    justify-content-center bg-light text-secondary w-100 my-4">
    <h2>点击上传头图</h2>
    <template #loading>
      <div class="d-flex">
        <div class="spinner-border text-secondary" role="status">
         <span class="sr-only"></span>
        </div>
        <h2>正在上传</h2>
      </div>
    </template>
    <template #uploaded="dataProps">
      <img :src="dataProps.uploadedData.data.url" alt="">
    </template>
  </Uploader>
  <h2>{{titleVal}}</h2>
    <validate-form @form-submit="onFormSubmit">
      <div class="mb-3">
        <label class="form-label">文章标题：</label>
        <validate-input
          :rules="titleRules" v-model="titleVal"
          placeholder="请输入文章标题"
          type="text"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">文章详情：</label>
        <Editor v-model="contentVal" :options="editorOptions" ref="editorRef"></Editor>
        <validate-input
          rows="10"
          type="text"
          tag="textarea"
          placeholder="请输入文章详情"
          :rules="contentRules"
          v-model="contentVal"
        />
      </div>
      <template #submit>
        <button class="btn btn-primary btn-large">{{isEditMode ? '更新文章' : '创建文章'}}</button>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'// useRoute 获取路由参数,useRouter 跳转路由
import { GlobalDataProps, PostProps, ResponseType, ImageProps } from '../store'
import Uploader from '../components/Uploader.vue'
import ValidateInput from '../components/ValidateInput.vue'
import type { RulesProp } from '../types'
import ValidateForm from '../components/ValidateForm.vue'
import createMessage from '../components/createMessage'
import { beforeUploadCheck } from '../helper'
import EasyMDE, { Options } from 'easymde'
import Editor from '../components/Editor.vue'
interface EditorInstance {
  clear: () => void
  getMDEInstance: () => EasyMDE | null
}
export default defineComponent({
  name: 'CreatePost',
  components: {
    ValidateInput,
    ValidateForm,
    Uploader,
    Editor
  },
  setup () {
    const uploadedData = ref()
    const titleVal = ref('')
    const router = useRouter()
    const store = useStore<GlobalDataProps>()
    const route = useRoute()
    const textArea = ref<null | HTMLTextAreaElement>(null)
    const isEditMode = !!route.query.id
    const editorRef = ref<null|EditorInstance>(null)
    let imageId = ''
    const editorOptions: Options = {
      spellChecker: false
    }
    const titleRules: RulesProp = [
      { type: 'required', message: '文章标题不能为空' }
    ]
    const contentVal = ref('')
    const contentRules: RulesProp = [
      { type: 'required', message: '文章详情不能为空' }
    ]
    onMounted(() => {
      if (editorRef.value) {
        console.log(editorRef.value.getMDEInstance())
      }
      if (isEditMode) {
        store.dispatch('fetchPost', route.query.id).then((rawData:ResponseType<PostProps>) => {
          const currentPost = rawData.data
          // 设置标题和内容，不管是否有图片
          titleVal.value = currentPost.title
          contentVal.value = currentPost.content || ''

          // 如果有图片，则设置图片数据
          if (currentPost.image) {
            uploadedData.value = {
              data: currentPost.image
            }
          }
        })
      }
    })
    const handleFileUploaded = (rawData: ResponseType<ImageProps>) => {
      if (rawData.data._id) {
        imageId = rawData.data._id
      }
    }
    const onFormSubmit = (result: boolean) => {
      if (result) {
        const { column, _id } = store.state.user
        if (column) {
          const newPost: PostProps = {
            title: titleVal.value,
            content: contentVal.value,
            column,
            author: _id
          }
          if (imageId) {
            newPost.image = imageId
          }
          const actionName = isEditMode ? 'updatePost' : 'createPost'
          const sendData = isEditMode
            ? {
                id: route.query.id,
                payload: newPost
              }
            : newPost
          store.dispatch(actionName, sendData).then(() => {
            createMessage('发表成功，2秒后跳转到文章', 'success', 2000)
            setTimeout(() => {
              router.push({ name: 'column', params: { id: column } })
            }, 2000)
          })
        }
      }
    }
    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const files = target.files
      if (files) {
        const uploadedFile = files[0]
        const formData = new FormData()
        formData.append(uploadedFile.name, uploadedFile)
        axios.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((resp: any) => {
          console.log(resp)
        })
      }
      console.log(files)
    }
    const uploadCheck = (file: File) => {
      const result = beforeUploadCheck(file, { format: ['image/jpeg', 'image/png'], size: 1 })
      const { passed, error } = result
      if (error === 'format') {
        createMessage('上传失败，请上传 jpg 或 png 格式的图片', 'error')
      }
      if (error === 'size') {
        createMessage('上传失败，请上传大小在 1MB 以下的图片', 'error')
      }
      return passed
    }
    return {
      titleRules,
      titleVal,
      contentVal,
      contentRules,
      onFormSubmit,
      handleFileChange,
      handleFileUploaded,
      uploadCheck,
      uploadedData,
      isEditMode,
      textArea,
      editorOptions,
      editorRef

    }
  }
})
</script>
<style>
.create-post-page .file-upload-container {
  height: 200px;
  cursor: pointer;
}
.create-post-page .file-upload-container img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

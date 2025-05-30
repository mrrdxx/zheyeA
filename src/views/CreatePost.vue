<template>
  <div class="create-post-page text-start">
    <h4>新建文章</h4>
    <Uploader action="/upload"
    :beforeUpload="uploadCheck"
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
        <button class="btn btn-primary btn-large">创建</button>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { GlobalDataProps, PostProps, ResponseType, ImageProps } from '../store'
import Uploader from '../components/Uploader.vue'
import ValidateInput from '../components/ValidateInput.vue'
import type { RulesProp } from '../types'
import ValidateForm from '../components/ValidateForm.vue'
import createMessage from '../components/createMessage'
import { beforeUploadCheck } from '../helper'

export default defineComponent({
  name: 'CreatePost',
  components: {
    ValidateInput,
    ValidateForm,
    Uploader
  },
  setup () {
    const titleVal = ref('')
    const router = useRouter()
    const store = useStore<GlobalDataProps>()
    let imageId = ''
    const titleRules: RulesProp = [
      { type: 'required', message: '文章标题不能为空' }
    ]
    const contentVal = ref('')
    const contentRules: RulesProp = [
      { type: 'required', message: '文章详情不能为空' }
    ]
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
          store.dispatch('createPost', newPost).then(() => {
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
      uploadCheck
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

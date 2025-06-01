<template>
  <div class="home-page">
    <section class="py-5 text-center container">
      <div class="row py-lg-5">
        <div class="col-lg-6 col-md-8 mx-auto">
          <img src="../assets/callout.svg" alt="callout" class="w-50" />
          <h2 class="font-weight-light">随心写作，自由表达</h2>
          <p>
            <router-link to="/create" class="btn btn-primary my-2">开始写文章吧</router-link>
          </p>
        </div>
      </div>
    </section>
    <!-- <Uploader action="/upload" :before-upload="beforeUpload"
    @file-uploaded="onFileUploaded">
      <template #uploaded="dataProps">
        <img :src="dataProps.uploadedData.data.url" width="500">
      </template>
    </Uploader> -->
    <div class="font-weight-bold text-center">
      <h4 class="font-weight-bold text-center">发现精彩</h4>
      <column-list :list="list"></column-list>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { GlobalDataProps, ImageProps, ResponseType } from '@/store'
import ColumnList from '../components/ColumnList.vue'
import { useStore } from 'vuex'
import Uploader from '../components/Uploader.vue'
import createMessage from '../components/createMessage'
export default defineComponent({
  /* eslint-disable vue/multi-word-component-names */
  name: 'Home',
  components: {
    ColumnList
  },
  setup () {
    const store = useStore<GlobalDataProps>()
    onMounted(() => {
      store.dispatch('fetchColumns')
      console.log('当前用户的专栏信息：', store.state.user.column)
    })
    const list = computed(() => store.state.columns)
    const beforeUpload = (file: File) => {
      const isJPG = file.type === 'image/jpeg'
      if (!isJPG) {
        createMessage('上传失败，请上传jpg格式图片', 'error')
      }
      return isJPG
    }
    const onFileUploaded = (rawData: ResponseType<ImageProps>) => {
      createMessage(`上传图片ID ${rawData.data._id}`, 'success')
    }
    const onFileUploadedError = (error: any) => {
      console.log(error)
    }
    return {
      list,
      onFileUploaded,
      onFileUploadedError,
      beforeUpload
    }
  }
})
</script>

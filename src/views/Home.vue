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
    <div class="font-weight-bold text-center">
      <h4 class="font-weight-bold text-center">发现精彩</h4>
      <column-list :list="list"></column-list>
      <button
      class="btn btn-outline-primary mt-2 mb-5 mx-auto btn-block w-25"
      @click="loadMorePage" v-if="!isLastPage">
      加载更多
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { GlobalDataProps, ImageProps, ResponseType } from '@/store'
import ColumnList from '../components/ColumnList.vue'
import { useStore } from 'vuex'
import Uploader from '../components/Uploader.vue'
import useLoadMore from '@/hooks/useLoaderMore'
import createMessage from '../components/createMessage'
export default defineComponent({
  /* eslint-disable vue/multi-word-component-names */
  name: 'Home',
  components: {
    ColumnList
  },
  setup () {
    const store = useStore<GlobalDataProps>()
    const total = computed(() => store.state.columns.total)
    onMounted(() => {
      store.dispatch('fetchColumns', { pageSize: 3 })
    })
    const list = computed(() => store.getters.getColumns)
    const { loadMorePage, isLastPage } = useLoadMore('fetchColumns', total, { pageSize: 3, currentPage: 2 })
    return {
      list,
      loadMorePage,
      isLastPage
    }
  }
})
</script>

<template>
  <form class="validate-form-container">
    <slot name="default"></slot>
    <!-- 这一个插槽吃了两个div，其实就是“默认插槽”，
     它会把父组件 <ValidateForm> 标签内
    所有没有指定具名插槽的内容，全部插入到这个位置。 -->
    <div class="submit-area" @click.prevent="submitForm">
      <slot name="submit">
        <button type="submit" class="btn btn-primary">提交</button>
      </slot>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import mitt from 'mitt'

type ValidateFunc = () => boolean
type Events = {
  'form-item-created': ValidateFunc
}
export const emitter = mitt<Events>()
export default defineComponent({
  name: 'ValidateForm',
  emits: ['form-submit'],
  setup (props, context) {
    let funcArr: ValidateFunc[] = []
    const submitForm = () => {
      const result = funcArr.map(func => func()).every(result => result)
      context.emit('form-submit', result)
    }
    const callback = (func: ValidateFunc) => {
      funcArr.push(func)
    }
    emitter.on('form-item-created', callback)
    onUnmounted(() => {
      emitter.off('form-item-created', callback)
      funcArr = []
    })
    return { submitForm }
  }
})
</script>

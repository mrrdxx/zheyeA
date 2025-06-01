<template>
  <div class="vue-easymde-editor">
  <textarea ref="textArea"></textarea>
</div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, onMounted, onUnmounted, defineComponent, defineExpose, watch } from 'vue'
import EasyMDE, { Options } from 'easymde'

interface EditorProps {
  modelValue?: string;
  options?: Options;
}

interface EditorEvents {
  (type: 'update:modelValue', value: string): void;
  (type: 'change', value: string): void;
  (type: 'blur'): void;
}
defineComponent({
  /* eslint-disable vue/multi-word-component-names */
  name: 'Editor'
})
const props = defineProps<EditorProps>()
const emit = defineEmits<EditorEvents>()
const textArea = ref<null | HTMLTextAreaElement>(null)
let easyMDEInstance: EasyMDE | null = null
const innerValue = ref(props.modelValue || '')
watch(() => props.modelValue, (newValue) => {
  if (easyMDEInstance) {
    if (newValue !== innerValue.value) {
      easyMDEInstance.value(newValue || '')
    }
  }
})
onMounted(() => {
  if (textArea.value) {
    const config: Options = {
      element: textArea.value,
      ...(props.options || {}),
      initialValue: innerValue.value
    }
    easyMDEInstance = new EasyMDE(config)
    easyMDEInstance.codemirror.on('change', () => {
      if (easyMDEInstance) {
        const updatedValue = easyMDEInstance.value()
        innerValue.value = updatedValue
        emit('update:modelValue', updatedValue)
        emit('change', updatedValue)
      }
    })
    easyMDEInstance.codemirror.on('blur', () => {
      if (easyMDEInstance) {
        emit('blur')
      }
    })
  }
})
onUnmounted(() => {
  if (easyMDEInstance) {
    easyMDEInstance.cleanup()
  }
  easyMDEInstance = null
})
const clear = () => {
  if (easyMDEInstance) {
    easyMDEInstance.value('')
  }
}
const getMDEInstance = () => {
  return easyMDEInstance
}
defineExpose({
  clear,
  getMDEInstance
})
</script>
<style>
.vue-easymde-editor.is-invalid {
  border: 1px solid #f50808;

}
</style>

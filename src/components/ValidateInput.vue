<template>
  <div class="validate-input-container pb-3">
    <input type="text"
           class="form-control"
           :class="{'is-invalid': inputRef.error}"
           :value="inputRef.val"
           @blur="validateInput"
           @input="updateValue"
           v-bind="$attrs"
           v-if="tag !== 'textarea'"
    />
    <textarea
      v-else
      class="form-control"
      :class="{'is-invalid': inputRef.error}"
      :value="inputRef.val"
      @blur="validateInput"
      @input="updateValue"
      v-bind="$attrs"
    ></textarea>
    <span v-if="inputRef.error" class="invalid-feedback">{{inputRef.message}}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, onMounted } from 'vue'
import { emitter } from './ValidateForm.vue'
import type { RulesProp } from '../types'
const emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
// export interface RuleProp {
//   type: 'required' | 'email';
//   message: string;
// }
// export type RulesProp = RuleProp[]
// 这些东西被移到types.ts文件中

export type TagType = 'input' | 'textarea'
export default defineComponent({
  props: {
    rules: Array as PropType<RulesProp>,
    modelValue: String,
    tag: {
      type: String as PropType<TagType>,
      default: 'input'
    }
  },
  inheritAttrs: false,
  /* context 对象包含以下主要属性：
attrs：包含所有传递给组件的非 prop 属性
slots：包含所有插槽内容
emit：用于触发事件的函数
expose：用于暴露组件实例上的属性 */
  setup (props, context) {
    const inputRef = reactive({
      val: props.modelValue || '',
      error: false,
      message: ''
    })
    const updateValue = (e: KeyboardEvent) => {
      const targetValue = (e.target as HTMLInputElement).value
      inputRef.val = targetValue
      context.emit('update:modelValue', targetValue)
    }
    const validateInput = () => {
      if (props.rules) {
        const allPassed = props.rules.every(rule => {
          let passed = true
          inputRef.message = rule.message
          /* every 是 JavaScript/TypeScript 数组的一个方法，用于检查数组中的所有元素是否都满足某个条件。它的特点是：
对数组中的每个元素执行测试函数
只有当所有元素都通过测试时，才返回 true
如果有一个元素不满足条件，就返回 false 并停止检查 */
          switch (rule.type) {
            case 'required':
              passed = (inputRef.val.trim() !== '')
              break
            case 'email':
              passed = emailReg.test(inputRef.val)
              break
            // case 'range':
            //   passed = inputRef.val.length >= (rule.min || 0) && inputRef.val.length <= (rule.max || Infinity)
            //   break
            case 'custom':
              passed = rule.validator ? rule.validator() : true
              break
            default:
              break
          }
          return passed
        })
        inputRef.error = !allPassed
        return allPassed
      }
      return true
    }
    onMounted(() => {
      emitter.emit('form-item-created', validateInput)
    })
    return { inputRef, validateInput, updateValue }
  }
})
</script>

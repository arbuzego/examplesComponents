<template>
  <quiz-generator
    :form="forms"
    :btn-label="btnLabel"
    @submit="submitForm($event)"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'
import { isNotDefined } from '../packages/basis/scripts/defineHelpers'
import { FormMask } from '../contracts/FormMask'
import { QuizType } from '../contracts/QuizType'
import { Logger } from '../composition/Logger'
import { FormPost } from '@/apollo/queries/form'
import QuizGenerator from '@/components/QuizGenerator.vue'

const QUIZ_DATA = {
  productQuiz: [
    {
      id: 'helpPage',
      formKey: 'Помогла ли вам страница',
      title: 'Помогла ли вам страница?',
      field: 'BlockTagRow',
      mask: FormMask.NotSet,
      tagsData: [
        { linkText: 'Да, помогла', id: 'Да' },
        { linkText: 'Нет, к сожалению', id: 'Нет' },
      ],
      rules: ['required', 'helpPage'],
    },
    {
      showIf: (val: any) => val.helpPage === 'Нет',
      id: 'whatDo',
      formKey: 'Цель',
      title: 'Что именно вы хотели сделать?',
      field: 'BlockTagRow',
      mask: FormMask.NotSet,
      tagsData: [
        { linkText: 'Оформить полис онлайн', id: 'Полис' },
        { linkText: 'Изучить продукт', id: 'Продукт' },
        { linkText: 'Уточнить условия', id: 'Условия' },
      ],
      rules: ['whatDo'],
    },
    {
      showIf: (val: any) => val.helpPage === 'Да',
      id: 'success',
      formKey: 'Комментарий',
      title: 'Поделитесь, что понравилось больше всего, а что можно улучшить?',
      field: 'InputTextarea',
      mask: FormMask.NotSet,
      placeholder: 'Напишите, что думаете',
      maxlength: 500,
      rules: ['comment'],
    },
    {
      showIf: (val: any) => val.helpPage === 'Нет',
      id: 'fail',
      formKey: 'Комментарий',
      title: 'Как мы можем улучшить страницу?',
      field: 'InputTextarea',
      mask: FormMask.NotSet,
      placeholder: 'Напишите, что думаете',
      maxlength: 500,
      rules: ['comment'],
    },
  ],
}

@Component
class SectionQuiz extends Vue {
  @Prop() readonly quizType: string = ''
  @Prop() readonly idRecipients: string = null
  static options: any
}

export default defineComponent({
  name: 'SectionQuiz',
  components: {
    QuizGenerator,
  },
  props: SectionQuiz.options.props,
  setup(props, { emit }) {
    const {
      app: {
        apolloProvider: {
          defaultClient: { mutate },
        },
      },
    } = useContext()
    const btnLabel = computed(() => {
      let btnLabel = 'Свяжитесь со мной'
      if (props.quizType === QuizType.productQuiz) {
        btnLabel = 'Отправить'
      }
      return btnLabel
    })
    const forms = computed((): ReadonlyArray<any> => {
      const relevantForm = (QUIZ_DATA as any)[props.quizType]

      if (isNotDefined(relevantForm))
        Logger.error('Не удалось найти форму по типу')

      return relevantForm
    })

    const submitForm = async (formData) => {
      emit('update:loading', true)
      let desk = ''
      desk += `Продукт: ${window.location.href}<br>`
      const value = { ...formData }

      for (const key in value) {
        const { formKey } = forms.value.find((form) => form.id === key) || {}
        desk += `${formKey}: ${value[key]}<br>`
      }

      const filters = {
        name: `Новые результаты опроса с сайта`,
        description: desk,
        iblockCode: `form-${props.quizType}`,
      }

      if (props.idRecipients) {
        filters.emailPropId = props.idRecipients
      }

      try {
        const { data: { createElement = false } = {} } = await mutate({
          mutation: FormPost,
          variables: filters,
        })
        emit(createElement ? 'success' : 'failed')
        emit('update:loading', false)
      } catch (e) {
        emit('failed')
        emit('update:loading', false)
        Logger.error(e)
      }
    }

    return {
      forms,
      submitForm,
      btnLabel,
    }
  },
})
</script>

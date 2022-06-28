<template>
  <section-basic
    :section-data="sectionData"
    :title-no-margin="true"
    :loading="loading"
  >
    <template slot="sectionContent">
      <block-quizzes
        v-if="showForm"
        :id-recipients="idRecipients"
        :quiz-type="quizType"
        :loading.sync="loading"
        @success="onSuccess(true)"
        @failed="onSuccess(false)"
      />
      <f-block-animation
        v-else
        v-html-safe="message"
        class="subtitle text--basic-second"
      >
      </f-block-animation>
    </template>
  </section-basic>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { defineComponent, ref } from '@nuxtjs/composition-api'
import { SectionCore } from '../mixins/sectionCore'
import SectionBasic from '@/components/SectionBasic.vue'
import BlockQuizzes from '@/components/BlockQuizzes.vue'

@Component
class SectionQuiz extends mixins(SectionCore) {
  @Prop() readonly quizType: string = ''
  static options: any
}

export default defineComponent({
  name: 'SectionQuiz',
  components: {
    SectionBasic,
    BlockQuizzes,
  },
  props: SectionQuiz.options.props,
  setup(props) {
    const loading = ref(false)
    const message = ref('')
    const showForm = ref(true)
    const onSuccess = (value) => {
      showForm.value = !showForm.value
      message.value = value
        ? props.successMessage
        : 'Что-то пошло не так при отправке формы.'
    }
    return {
      onSuccess,
      showForm,
      message,
      loading,
    }
  },
})
</script>

<style lang="scss" scoped>
.subtitle {
  color: $TEXT_SECONDARY;
  margin-top: 2.4rem;
  @include mobile {
    margin-top: 1.6rem;
  }
}
</style>

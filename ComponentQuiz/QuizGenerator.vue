<template>
  <form
    ref="form"
    novalidate
    autocomplete="off"
    @submit.prevent="debouncedSubmitHandler($event)"
  >
    <f-row class="form-wrapper">
      <f-col
        v-for="(component, i) in showFormFields"
        :key="i"
        :col="7"
        :md="6"
        :sm="2"
      >
        <f-block-animation :key="i">
          <h3 v-html-safe="component.title" class="title title--h3" />
          <component
            :is="component.field"
            :class="prover(component.tagsData)"
            :value="model[component.id]"
            :error="showError && errors[i]"
            v-bind="component"
            class="component"
            @input-change="onChange($event, component.id)"
            @input="onChange($event, component.id)"
          />
        </f-block-animation>
      </f-col>
      <f-col v-if="showButtonSubmit" :col="7" :md="6" :sm="2">
        <f-block-animation>
          <button
            v-html-safe="btnLabel"
            type="submit"
            class="button-submit btn--basic"
            :class="{
              'btn--disabled': showError && validForm,
            }"
            :disabled="showError && validForm"
          ></button>
        </f-block-animation>
      </f-col>
    </f-row>
  </form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { computed, defineComponent, ref } from '@nuxtjs/composition-api'
import { debounce } from 'throttle-debounce'
import { FormInputBasic } from '../contracts/FormInput'
import { isNotDefined } from '../packages/basis/scripts/defineHelpers'
import InputTextarea from '@/components/Inputs/InputTextarea.vue'
import BlockTagRow from '@/components/Tags/BlockTagRow.vue'
import { validators } from '@/validation'

@Component
class SectionQuiz extends Vue {
  @Prop() readonly form: ReadonlyArray<any> = []
  @Prop() readonly btnLabel: string = ''
  static options: any
}

export default defineComponent({
  name: 'SectionQuiz',
  components: {
    BlockTagRow,
    InputTextarea,
  },
  props: SectionQuiz.options.props,
  setup(props, ctx) {
    const prover = (array) => {
      return array && array.length <= 2 ? 'twoTags' : 'moreTags'
    }
    const debouncedSubmitHandler = ref(null)

    const model = ref({})
    const errors = ref<boolean[]>([])
    const validForm = computed(() => errors.value.find((item: any) => item))
    const showError = ref(false)

    const checkErrors = () => {
      errors.value = props.form.map((form: FormInputBasic) => {
        if (
          isNotDefined(form.rules) ||
          !Array.isArray(form.rules) ||
          form.rules.length === 0
        )
          return false

        let error = false
        form.rules.forEach((rule: any) => {
          const errorLocal =
            rule in validators &&
            (validators as any)[rule](
              (model.value as any)[form.id],
              (form as any)[rule]
            )
          if (errorLocal) error = errorLocal
        })

        return error
      })
    }

    const onChange = (val: any, key: any) => {
      if (val && val.linkText) {
        ctx.root.$set(model.value, key, val.id)
      } else {
        ctx.root.$set(model.value, key, val)
      }
      checkErrors()
    }
    const showFormFields = computed(() =>
      props.form.filter((item) => !item.showIf || item.showIf(model.value))
    )

    const showButtonSubmit = computed(() => {
      const modelKeys = Object.keys(model.value)
      const requiredKeys = props.form
        .filter((input) => input.rules && input.rules.includes('required'))
        .map((input) => input.id)
      return modelKeys.length
        ? modelKeys.filter((key) => requiredKeys.includes(key)).length ===
            requiredKeys.length
        : false
    })
    debouncedSubmitHandler.value = debounce(500, () => {
      submitPrevent()
    })
    const submitPrevent = () => {
      checkErrors()
      if (validForm.value) {
        showError.value = true
      } else {
        ctx.emit('submit', model.value)
      }
    }

    return {
      showFormFields,
      debouncedSubmitHandler,
      onChange,
      model,
      prover,
      showButtonSubmit,
      showError,
      validForm,
      errors,
    }
  },
})
</script>

<style lang="scss" scoped>
.button-submit {
  margin-top: 4rem;
  width: 100%;
}
.form-wrapper {
  flex-direction: column;
}
.component {
  /deep/.link-wrapper {
    margin-bottom: unset;
  }
}
.twoTags {
  /deep/ {
    .wrapper {
      flex-wrap: nowrap;
      white-space: nowrap;
      .link-wrapper:first-child {
        @include mobile {
          margin-right: 0.8rem;
        }
      }
    }
  }
}
.moreTags {
  /deep/ {
    .link-wrapper:not(:last-child) {
      @include mobile {
        margin-bottom: 0.8rem;
      }
    }
  }
}

.title {
  color: $TEXT_PRIMARY;
  margin-bottom: 3.2rem;
  margin-top: 4.8rem;
  @include mobile {
    margin-bottom: 2.4rem;
  }
}
</style>

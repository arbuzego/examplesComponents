<template>
  <f-section class="section-vacancies-hero">
    <f-container>
      <h1 class="vacancies-hero-title title--h1" v-html="coloredTitle"></h1>
      <f-row class="form-body">
        <form class="vacancies-hero-form" @submit.prevent="toVacancies">
          <input-select
            :select-options="listSpecialties"
            :label="inputsData.labelInputSelect"
            :placeholder="inputsData.placeholderInputSelect"
            :no-result-text="
              loadFilter
                ? 'Загружаем специализации ...'
                : inputsData.noResultTextSelect
            "
            :value="filters.speciality"
            :return-option-value="true"
            class="vacancies-hero-item"
            @input-change="changeSpeciality"
          />
          <input-text
            :label="inputsData.labelInputText"
            :placeholder="inputsData.placeholderInputText"
            :value="filters.search"
            class="vacancies-hero-item"
            :tooltip="tooltip"
            @input-change="changeSearchDebounce"
          />
          <button type="submit" class="vacancies-hero-item btn--basic">
            {{ buttonText }}
          </button>
        </form>
      </f-row>
    </f-container>
  </f-section>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  useStore,
  useContext,
  useRouter,
} from '@nuxtjs/composition-api'
import { reactive } from '@vue/composition-api'
import { debounce } from 'throttle-debounce'
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Context } from '@nuxt/types'
import { TypePages } from '../contracts/PageTypes'
import { useColoredTitle } from '../composition/coloredTitle'
import { HTTP_REST_FRONTEND_API } from '../plugins/axiosFrontendApi'
import { VACANCY_FILTER } from '../config/feApi'
import InputText from '@/components/Inputs/InputText.vue'
import InputSelect from '@/components/Inputs/InputSelect.vue'

@Component
class SectionVacanciesHero extends Vue {
  @Prop() readonly buttonText: string = ''
  @Prop() readonly title: string = ''
  static options: any
}

export default defineComponent({
  name: 'SectionVacanciesHero',
  components: { InputSelect, InputText },
  props: SectionVacanciesHero.options.props,
  setup(props) {
    const {
      getters: { 'settings/pagesList': list },
    } = useStore()
    const loadFilter = ref(false)
    const router = useRouter()

    const tooltip = reactive({
      icon: 'icon/search',
    })

    const listSpecialties = ref([])

    const { coloredTitle } = useColoredTitle(props.title)

    const inputsData = ref({
      labelInputSelect: 'Выберите специализацию',
      placeholderInputSelect: 'например, дизайн',
      noResultTextSelect: 'К сожалению, ничего не найдено',
      labelInputText: 'Название должности или ключевые слова',
      placeholderInputText: 'например, бухгалтер',
    })

    const ctx = useContext()

    const filters = reactive({
      speciality: undefined,
      search: undefined,
    })

    const getDataVacancyFilters = async () => {
      loadFilter.value = true
      const {
        data: { listSpecialties: specialties },
      } = await HTTP_REST_FRONTEND_API(ctx as Context).get(VACANCY_FILTER)
      listSpecialties.value = specialties
      loadFilter.value = false
    }
    getDataVacancyFilters()

    const changeSpeciality = (value: any) => {
      filters.speciality = value
    }

    const changeSearchDebounce = debounce(500, (value: any) => {
      filters.search = value
    })

    const toVacancies = () => {
      let url = ''
      list.forEach((item: any) => {
        if (item.uniquePages === TypePages.vacancies) {
          url = item.fullPath
        }
      })
      router.push({ path: url, query: filters })
    }

    return {
      listSpecialties,
      inputsData,
      filters,
      changeSpeciality,
      changeSearchDebounce,
      tooltip,
      coloredTitle,
      toVacancies,
      loadFilter,
    }
  },
})
</script>

<style lang="scss" scoped>
.section-vacancies-hero {
  overflow: visible;
  @include tablet_desktop {
    background: url('../assets/svg/map.svg') right 0 top -4.5rem / 60rem 100% no-repeat;
  }
}

.vacancies-hero {
  position: relative;
}

.vacancies-hero-title {
  color: $TEXT_PRIMARY;
  @include tablet_desktop {
    max-width: 93rem;
  }
}

.vacancies-hero-form {
  align-items: flex-end;
  padding-top: 9.6rem;
  display: flex;
  width: 100%;

  @include mobile {
    padding-top: 4.8rem;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
  }
}

.vacancies-hero-item {
  @include tablet_desktop {
    flex: 0 1 33.33%;
    &:not(:last-child) {
      margin-right: 3.2rem;
    }
  }
  @include mobile {
    width: 100%;
    margin-bottom: 2.4rem;
  }
  &:last-child {
    padding: 2.4rem;
  }
}
</style>

<template>
  <f-section class="section-search-vacancy">
    <f-container>
      <block-bread-crumbs class="breadcrumbs-vacancy" />
      <h1
        v-html-safe="coloredTitle"
        class="title-filters title--h1 word-breaking"
      />
      <block-vacancy-filters
        :input-select-data="blockFiltersData.inputSelectData"
        :input-region-data="blockFiltersData.inputRegionData"
        :input-text-data="blockFiltersData.inputTextData"
        :no-result-text-select="blockFiltersData.noResultTextSelect"
        :list-specialties="listSpecialties"
        :list-regions="listRegions"
      />
      <Loader :loading="searchLoading">
        <f-row class="section-vacancies">
          <f-col style="order: 1" :col="9" :md="8" :sm="2">
            <h2
              v-if="totalCountVacancies && !searchError"
              class="section-vacancies-title title--h2"
              v-html="vacanciesTitle"
            ></h2>
            <template v-else>
              <h2 class="section-vacancies-title-empty title--h2">
                {{ sectionDataLocal.emptyVacanciesTitle }}
              </h2>
              <f-row>
                <f-col :col="6" :md="4" :sm="2">
                  <p
                    v-html-safe="
                      searchError
                        ? searchErrorText
                        : sectionDataLocal.emptyVacanciesText
                    "
                    class="section-vacancies-description text--basic-second"
                  />
                </f-col>
              </f-row>
            </template>
            <template v-if="!searchError">
              <card-vacancy-list :vacancy-list-data="listVacancies" />
              <f-block-animation>
                <button
                  v-if="showButton"
                  class="vacancy-btn btn--second"
                  type="button"
                  @click="counter"
                >
                  {{ buttonText }}
                </button>
              </f-block-animation>
            </template>
          </f-col>
          <f-col :col="3" :md="8" :sm="2">
            <h3
              v-html-safe="sectionDataLocal.sideTitle"
              class="section-vacancies-title-side text--subheading"
            ></h3>
          </f-col>
        </f-row>
      </Loader>
    </f-container>
  </f-section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import {
  computed,
  defineComponent,
  ref,
  useContext,
  useRoute,
  useStore,
  watch,
} from '@nuxtjs/composition-api'
import { Context } from '@nuxt/types'
import { useColoredTitle } from '../composition/coloredTitle'
import { Logger } from '../composition/Logger'
import { HTTP_REST_FRONTEND_API } from '../plugins/axiosFrontendApi'
import { VACANCY } from '../config/feApi'
import Loader from '@/plugins/loader/Load.vue'
import CardVacancyList from '@/components/CardLists/CardVacancyList.vue'
import BlockVacancyFilters from '@/components/BlockVacancyFilters.vue'
import BlockBreadCrumbs from '@/components/BlockBreadCrumbs.vue'

@Component
class SectionSearchVacancy extends Vue {
  @Prop() readonly sectionDataLocal: object = {}
  @Prop() readonly searchError: boolean = false
  @Prop() readonly listSpecialties: ReadonlyArray<any> = []
  @Prop() readonly listRegions: ReadonlyArray<any> = []
  @Prop() readonly initialListVacancies: ReadonlyArray<any> = []
  @Prop({ default: 0 }) readonly initialTotalCountVacancies: number = 0

  static options: any
}

export default defineComponent({
  name: 'SectionSearchVacancy',
  components: {
    BlockVacancyFilters,
    BlockBreadCrumbs,
    CardVacancyList,
    Loader,
  },
  props: SectionSearchVacancy.options.props,
  setup(props: SectionSearchVacancy) {
    const searchLoading = ref(false)
    const { coloredTitle } = useColoredTitle(
      props.sectionDataLocal.titleFilters
    )
    const { getters } = useStore()
    const ctx = useContext()
    const buttonText = computed(() => getters['settings/btnLoadMore'])
    const searchErrorText =
      'Что-то пошло не так при загрузке результатов поиска. Попробуйте обновить страницу или зайти позже'
    const blockFiltersData = ref({
      noResultTextSelect: 'К сожалению, ничего не найдено',
      inputSelectData: {
        labelInputSelect: 'Выберите специализацию',
        placeholderInputSelect: 'например, Дизайн',
      },
      inputRegionData: {
        labelInputSelect: 'Выберите регион',
        placeholderInputSelect: 'например, Москва',
      },
      inputTextData: {
        labelInputText: 'Название должности или ключевые слова',
        placeholderInputText: 'например, бухгалтер',
      },
    })
    const constShowVacancies = ref(5) // по сколько вакансий показывать
    const countShowVacancies = ref(constShowVacancies)
    const totalCountVacancies = ref(props.initialTotalCountVacancies)
    const listVacancies = ref(props.initialListVacancies)
    const route = useRoute()
    const vacanciesTitle = computed(
      () =>
        `Специально для вас <br> мы подобрали <span class='colored-title'>${getNoun(
          totalCountVacancies.value
        )}</span>`
    )
    const getNoun = (number) => {
      let n = Math.abs(number)
      n %= 100
      if (n >= 5 && n <= 20) {
        return `${number} вакансий`
      }
      n %= 10
      if (n === 1) {
        return `${number} вакансию`
      }
      if (n >= 2 && n <= 4) {
        return `${number} вакансии`
      }
      return `${number} вакансий`
    }
    const showButton = computed(
      () => countShowVacancies.value < totalCountVacancies.value
    )
    const counter = () => (countShowVacancies.value += constShowVacancies.value)
    const getVacancies = async () => {
      searchLoading.value = true
      const vacancyFilters = {
        first: countShowVacancies.value,
      }
      if (
        route.value.query.search &&
        typeof route.value.query.search === 'string'
      ) {
        vacancyFilters.search = route.value.query.search
      }
      if (
        route.value.query.region &&
        typeof route.value.query.region === 'string'
      ) {
        vacancyFilters.region = route.value.query.region
      }
      if (
        route.value.query.speciality &&
        typeof route.value.query.speciality === 'string'
      ) {
        vacancyFilters.speciality = route.value.query.speciality
      }
      try {
        const {
          data: { vacancyData, elementsCount },
        } = await HTTP_REST_FRONTEND_API(ctx as Context).get(VACANCY, {
          params: vacancyFilters,
        })
        totalCountVacancies.value = elementsCount
        listVacancies.value = vacancyData
        searchLoading.value = false
      } catch (e) {
        Logger.error(e)
        searchLoading.value = false
        // eslint-disable-next-line vue/no-mutating-props
        props.searchError = true
      }
    }
    watch(countShowVacancies, getVacancies)
    watch(route, getVacancies)

    return {
      showButton,
      counter,
      blockFiltersData,
      listVacancies,
      totalCountVacancies,
      vacanciesTitle,
      buttonText,
      coloredTitle,
      searchLoading,
      searchErrorText,
    }
  },
})
</script>

<style lang="scss" scoped>
section.section.section-search-vacancy {
  overflow: unset;
}

.vacancy-btn {
  margin-top: 2.4rem;
  @include mobile {
    width: 100%;
    margin-top: 1.6rem;
  }
}

.breadcrumbs-vacancy {
  margin-bottom: 2.4rem;
  @include mobile {
    display: none;
  }
}

.title-filters {
  color: $TEXT_PRIMARY;
  margin-bottom: 9.6rem;
  @include mobile {
    margin-bottom: 4.8rem;
  }
}

.section-vacancies {
  @include tablet_desktop {
    padding-top: 4.8rem;
  }
}

.section-vacancies-description {
  color: $TEXT_SECONDARY;
}

.section-vacancies-title {
  color: $TEXT_PRIMARY;
  @include desktop {
    margin-bottom: 4.8rem;
  }
  @include mobile_tablet {
    margin-bottom: 2.4rem;
  }
}

.section-vacancies-title-empty {
  color: $TEXT_PRIMARY;
  @include desktop {
    margin-bottom: 1.6rem;
  }
  @include mobile_tablet {
    margin-bottom: 0.8rem;
  }
}

.section-vacancies-title-side {
  @include desktop {
    align-items: flex-start;
    max-width: 21rem;
  }

  color: $TEXT_SECONDARY;
  letter-spacing: 0.03rem;
  @include mobile_tablet {
    margin-bottom: 0.8rem;
  }
}
</style>

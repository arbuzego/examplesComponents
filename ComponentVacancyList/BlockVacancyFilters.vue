<template>
  <div class="vacancy-filters">
    <button
      v-if="show"
      type="button"
      class="btn-clear btn--basic"
      @click="clearFilters"
    >
      {{ buttonClearText }}
    </button>
    <input-select
      :select-options="listSpecialties"
      :label="inputSelectData.labelInputSelect"
      :placeholder="inputSelectData.placeholderInputSelect"
      :no-result-text="noResultTextSelect"
      :value="filters.speciality"
      :return-option-value="true"
      class="vacancy-filters-item"
      @input-change="changeSpeciality"
    />
    <input-select
      :label="inputRegionData.labelInputSelect"
      :placeholder="inputRegionData.placeholderInputSelect"
      :no-result-text="noResultTextSelect"
      class="vacancy-filters-item"
      :value="filters.region"
      :return-option-value="true"
      :select-options="listRegions"
      @input-change="changeRegion"
    />
    <input-text
      :label="inputTextData.labelInputText"
      :placeholder="inputTextData.placeholderInputText"
      :value="filters.search"
      class="vacancy-filters-item"
      :tooltip="tooltip"
      @input-change="changeSearchDebounce"
    />
  </div>
</template>

<script lang="ts">
import { reactive } from '@vue/composition-api'
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import {
  defineComponent,
  ref,
  useRoute,
  useRouter,
  watch,
} from '@nuxtjs/composition-api'
import { debounce } from 'throttle-debounce'
import InputText from '@/components/Inputs/InputText.vue'
import InputSelect from '@/components/Inputs/InputSelect.vue'

@Component
class BlockVacanncyFilters extends Vue {
  @Prop() readonly inputSelectData: Object = {}
  @Prop() readonly inputRegionData: Object = {}
  @Prop() readonly inputTextData: Object = {}
  @Prop() readonly listSpecialties: Array = []
  @Prop() readonly listRegions: Array = []
  @Prop() readonly noResultTextSelect: String = ''
  static options: any
}

export default defineComponent({
  name: 'BlockVacanncyFilters',
  components: { InputText, InputSelect },
  props: BlockVacanncyFilters.options.props,
  setup() {
    const router = useRouter()
    const show = ref(false)
    const buttonClearText = ref('Сбросить все фильтры')
    const {
      value: {
        query: { search, speciality, region },
      },
    } = useRoute()

    const filters = reactive({
      search,
      region,
      speciality,
    })
    const clearFilters = () => {
      router.push({ query: {} })
      filters.search = undefined
      filters.region = undefined
      filters.speciality = undefined
    }
    const showButton = () => {
      if (filters.search || filters.region || filters.speciality) {
        show.value = true
      } else show.value = false
    }
    showButton()
    watch(filters, showButton)
    const tooltip = reactive({
      icon: 'icon/search',
    })
    const changeSearchDebounce = debounce(500, (value: any) => {
      filters.search = value
      router.push({ query: { ...filters } })
    })
    const changeRegion = (value: any) => {
      filters.region = value
      router.push({ query: { ...filters } })
    }
    const changeSpeciality = (value: any) => {
      filters.speciality = value
      router.push({ query: { ...filters } })
    }
    return {
      filters,
      changeSpeciality,
      changeRegion,
      tooltip,
      changeSearchDebounce,
      clearFilters,
      buttonClearText,
      show,
    }
  },
})
</script>

<style lang="scss" scoped>
.btn-clear {
  position: fixed;
  right: 2.4rem;
  bottom: 2.4rem;
  z-index: 1;
  @include mobile {
    padding: 1.6rem 3.2rem;
    right: 1.6rem;
    bottom: 1.6rem;
  }
}
.vacancy-filters {
  display: flex;
  @include tablet_desktop {
    align-items: flex-end;
    padding-bottom: 9.6rem;
    border-bottom: 1px solid $BORDER_PRIMARY;
  }
  @include mobile {
    padding-bottom: 6.2rem;
    flex-direction: column;
  }
}

.vacancy-filters-item {
  @include tablet_desktop {
    flex: 1 1 33.33%;
    &:not(:last-child) {
      margin-right: 3.2rem;
    }
  }
  @include mobile {
    &:not(:last-child) {
      margin-bottom: 2.4rem;
    }
  }
}
</style>

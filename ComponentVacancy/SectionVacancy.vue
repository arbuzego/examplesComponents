<template>
  <section-basic class="vacancy" :section-data="sectionData">
    <template #breadCrumbs>
      <block-bread-crumbs class="vacancy-breadcrumbs" />
    </template>
    <template #sectionContent>
      <div class="vacancy-item-wrapper">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="vacancy-item text--basic"
        >
          <p class="vacancy-item-text">{{ item.text }}</p>
          <p class="vacancy-item-title">{{ item.title }}</p>
        </div>
      </div>
      <intersect @enter="onEnter" @leave="onLeave">
        <button type="button" class="vacancy-btn btn--basic" @click="onClick">
          {{ textButton }}
        </button>
      </intersect>
      <transition
        v-if="showButton && formView && clickShowButton"
        name="fade"
        mode="out-in"
      >
        <button
          type="button"
          class="vacancy-btn-leave btn--basic"
          @click="onClick"
        >
          {{ textButtonLeave }}
        </button>
      </transition>
      <block-text :text-data="description"></block-text>
    </template>
  </section-basic>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import {
  defineComponent,
  ref,
  useStore,
  computed,
  onBeforeUnmount,
} from '@nuxtjs/composition-api'
import Intersect from 'vue-intersect'
import { throttle } from 'throttle-debounce'
import { TypePages } from '../contracts/PageTypes'
import BlockText from '@/components/BlockText.vue'
import SectionBasic from '@/components/SectionBasic'
import BlockBreadCrumbs from '@/components/BlockBreadCrumbs.vue'
import { buttonsAction } from '@/composition/buttons'

@Component
class SectionVacancy extends Vue {
  @Prop() readonly data: object = {}
  @Prop() readonly items: ReadonlyArray<any> = []
  @Prop() readonly description: string = ''
  @Prop() readonly idRecipients: string = ''
  static options: any
}

export default defineComponent({
  name: 'SectionVacancy',
  components: {
    BlockText,
    BlockBreadCrumbs,
    SectionBasic,
    Intersect,
  },
  props: SectionVacancy.options.props,
  setup(props) {
    const {
      getters: { 'settings/pagesList': list },
    } = useStore()
    const { clickHandler } = buttonsAction()
    const textButton = ref('Откликнуться на вакансию')
    const textButtonLeave = ref('Откликнуться')
    const showButton = ref(false)
    const clickShowButton = ref(true)
    const formView = ref(true)
    const url = ref('')

    list.forEach((item: any) => {
      if (item.uniquePages === TypePages.vacancies) {
        url.value = item.fullPath
      }
    })
    const sectionData = computed(() => {
      const obj = props.data
      obj.sectionTags.map((item) => {
        return (item.url = `${url.value}?search=${item.name}`)
      })
      return obj
    })
    const onClick = () => {
      clickShowButton.value = false
      clickHandler('scrollToForm')
      setTimeout(() => {
        clickShowButton.value = true
      }, 2000)
    }

    const onScroll = throttle(50, () => {
      if (process.browser) {
        const position = document
          .querySelector('.section-form-anchor')
          .getBoundingClientRect()
        if (position.top < window.innerHeight && position.bottom >= 0) {
          formView.value = false
        } else {
          formView.value = true
        }
      }
    })
    onBeforeUnmount(() => {
      if (process.browser) {
        window.removeEventListener('scroll', onScroll)
      }
    })
    if (process.browser) {
      window.addEventListener('scroll', onScroll)
    }

    const onEnter = () => {
      showButton.value = false
    }

    const onLeave = () => {
      showButton.value = true
    }

    return {
      onEnter,
      onLeave,
      showButton,
      textButton,
      textButtonLeave,
      onClick,
      formView,
      clickShowButton,
      sectionData,
    }
  },
})
</script>

<style lang="scss" scoped>
.vacancy /deep/ .tags-list {
  margin-bottom: 4rem;
}
.vacancy-breadcrumbs {
  margin-bottom: 2.4rem;
  @include mobile {
    margin-bottom: 1.6rem;
  }
}
.vacancy-item-wrapper {
  margin-bottom: 4rem;
  @include mobile {
    margin-bottom: 3.2rem;
  }
}
.vacancy-item {
  &:not(:last-child) {
    margin-bottom: 2.4rem;
    @include mobile {
      margin-bottom: 1.6rem;
    }
  }
  &-text {
    color: $SECONDARY;
    margin-bottom: 0.8rem;
    @include mobile {
      margin-bottom: 0.4rem;
    }
  }

  &-title {
    color: $TEXT_PRIMARY;
  }
}

.vacancy-btn {
  position: static;
  margin-bottom: 9.6rem;
  @include tablet_desktop {
    padding: 1.6rem 19rem;
  }
  @include mobile {
    margin-bottom: 6.4rem;
    width: 100%;
  }
}
.vacancy-btn-leave {
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
</style>

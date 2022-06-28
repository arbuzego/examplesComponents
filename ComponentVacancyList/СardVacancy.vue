<template>
  <Link class="card-vacancy" :url="fullUrl">
    <p class="card-vacancy-department text--second">
      {{ departament }}
    </p>
    <h3 class="card-vacancy-title title--h3">
      {{ title }}
    </h3>
    <div class="card-vacancy-footer text--small">
      <p v-for="(tag, id) in tags" :key="id" class="tag">
        {{ tag }}
      </p>
    </div>
  </Link>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { computed, defineComponent, useStore } from '@nuxtjs/composition-api'
import { TypePages } from '../../contracts/PageTypes'
import Link from '@/components/Link.vue'

@Component({})
class CardVacancyResult extends Vue {
  @Prop() readonly departament: String = ''
  @Prop() readonly title: String = ''
  @Prop() readonly code: String = ''
  @Prop() readonly tags: ReadonlyArray<any> = []
  static options: any
}

export default defineComponent({
  name: 'CardVacancyResult',
  components: { Link },
  props: CardVacancyResult.options.props,
  setup(props: CardVacancyResult) {
    const {
      getters: { 'settings/pagesList': list },
    } = useStore()

    const fullUrl = computed(() => {
      let url = ''
      list.forEach((item: any) => {
        if (item.uniquePages === TypePages.vacancy) {
          url = item.fullPath.split('/').slice(0, -1).join('/')
        }
      })
      return url + '/' + props.code
    })
    return {
      fullUrl,
    }
  },
})
</script>

<style scoped lang="scss">
.tag {
  display: flex;
  &:not(:last-child)::after {
    display: block;
    content: '';
    height: 0.2rem;
    width: 0.2rem;
    background: $TEXT_PRIMARY;
    margin: auto 0.8rem;
  }
}
.card-vacancy {
  display: block;
  padding: 2.4rem 0;
  color: $TEXT_PRIMARY;
  transition: background-color 0.25s ease;
  &:hover {
    .card-vacancy-department,
    .card-vacancy-title,
    .card-vacancy-footer {
      color: $PRIMARY_HOVER;
    }
    .tag::after {
      background: $PRIMARY_HOVER;
    }
  }
  @include mobile {
    padding: 1.6rem 0;
  }
}

.card-vacancy-department {
  margin-bottom: 0.8rem;
  color: $PRIMARY;
  transition: color 0.25s ease;
}

.card-vacancy-title {
  transition: color 0.25s ease;
  margin-bottom: 4.8rem;
  @include mobile {
    margin-bottom: 3.2rem;
  }
}

.card-vacancy-footer {
  display: flex;
  transition: color 0.25s ease;
}
</style>

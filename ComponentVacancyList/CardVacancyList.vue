<template>
  <div class="block-cards-list">
    <f-block-animation
      v-for="(card, index) in vacancyListData"
      :key="index"
      class="card-container"
      :delay="index / 10"
    >
      <card-vacancy
        :departament="card.specializationName"
        :title="card.name"
        :tags="card.tags"
        :code="card.code"
      />
    </f-block-animation>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { defineComponent } from '@nuxtjs/composition-api'
import CardVacancy from '../Cards/СardVacancy.vue'

@Component
class CardsVacancyList extends Vue {
  @Prop() readonly vacancyListData: ReadonlyArray<any> = []
  static options: any
}

export default defineComponent({
  name: 'CardsVacancyList',
  components: {
    CardVacancy,
  },
  props: CardVacancyList.options.props,
  setup() {},
})
</script>

<style lang="scss" scoped>
.card-container::after,
.card-container:first-child::before {
  content: '';
  display: block;
  background-color: $BORDER_PRIMARY;
  height: 1px;
  width: 100%;
}
</style>

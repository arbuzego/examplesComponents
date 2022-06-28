<template>
  <main id="news" class="news">
    <div v-if="locale" class="container">
      <h1 class="text-h1">{{ locale?.header }}</h1>
      <span class="hr" />
      <div class="wrapper">
        <div class="row">
          <div
            ref="sticky"
            class="col-6 sub-sticky news-filtered"
            :class="{ shadow: isHeaderSticky }"
          >
            <div class="sticky-wrapper">
              <custom-select :title="titleDirection">
                <ul class="news__filter text-p2">
                  <li :key="locale?.filters[0]?.title">
                    <button @click="changeQuery('direction', undefined)">
                      {{ locale?.filters[0]?.title }}
                    </button>
                  </li>
                  <li
                    v-for="(val, c) in locale?.filters[0]?.tags"
                    :key="$keyGen(c)"
                  >
                    <button @click="changeQuery('direction', val?.id)">
                      {{ val?.text }}
                    </button>
                  </li>
                </ul>
              </custom-select>
              <custom-select :title="titleMonth">
                <ul class="news__filter text-p2">
                  <li :key="locale?.filters[1]?.title">
                    <button
                      @click="
                        changeQuery('month', undefined),
                          changeQuery('year', undefined)
                      "
                    >
                      {{ locale?.filters[1]?.title }}
                    </button>
                  </li>
                  <span class="hr" />
                  <DateSlider
                    :swiper-options="swiperOptions"
                    :years="years"
                    @activeIndex="changeQuery('year', years[$event])"
                  />
                  <li
                    v-for="(val, c) in locale?.filters[1]?.months"
                    :key="$keyGen(c)"
                    class="year-li"
                  >
                    <button
                      :class="{ disable: disable(c) }"
                      @click="changeQuery('month', c + 1)"
                    >
                      {{ val }}
                    </button>
                  </li>
                </ul>
              </custom-select>
            </div>
          </div>
        </div>
      </div>
      <div ref="articles" class="news__articles">
        <loading v-if="isLoading" :size="'8rem'" />

        <div v-else-if="items.length" class="row">
          <template v-for="(item, i) in items">
            <div
              v-if="item?.topic"
              :key="'topic-' + i"
              class="articles-order news-paper col-6"
            >
              <div class="news-paper__wrapper">
                <img :src="storageUrl + item?.img" :alt="item?.title" />
                <div class="news-paper__text">
                  <h2 :class="titleClass">{{ item?.title }}</h2>
                  <p class="topic" :class="isDesktop ? 'text-h3' : 'text-p1'">
                    {{ item?.topic }}
                  </p>
                  <footer>
                    <p :class="descClass">{{ item?.desc }}</p>
                    <custom-link
                      :to="storageUrl + item?.link?.href"
                      :text="item?.link?.text"
                      text-class="text-p2"
                    />
                  </footer>
                </div>
              </div>
            </div>
            <div
              v-else
              :key="'topic-' + i"
              class="articles-order col-6 col-t-3 col-d-4"
            >
              <CustomArticle
                :img="item?.img"
                :title="item?.title"
                :date="item?.date"
                :href="item?.href"
              />
            </div>
          </template>
        </div>
        <p v-else-if="locale?.not_found_text" class="error-text text-h1">
          {{ locale?.not_found_text }}
        </p>
      </div>
      <Pagination
        :current="filters.page"
        :limit="locale?.perPage"
        :total="totalItems"
        @changePage="changePage"
      />
      <div class="rules-wrapper">
        <a
          class="rules text-p2"
          target="_blank"
          :href="storageUrl + locale?.rules?.href"
        >
          {{ locale?.rules?.text }}
        </a>
      </div>
    </div>
  </main>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import seoMixin from '~/mixins/seoMixin'
import subheaderHandler from '~/mixins/subheaderHandler.js'
import CustomLink from '~/components/custom/CustomLink.vue'
import CustomSelect from '~/components/custom/CustomSelect.vue'
import Loading from '~/components/Loading'
import DateSlider from '~/components/blocks/DateSlider.vue'
import CustomArticle from '~/components/custom/CustomArticle.vue'
import Pagination from '~/components/Pagination.vue'

export default {
  name: 'News',
  components: {
    DateSlider,
    CustomArticle,
    Pagination,
    Loading,
    CustomSelect,
    CustomLink,
  },
  mixins: [seoMixin, subheaderHandler],
  inject: ['storageUrl'],
  async asyncData(ctx) {
    try {
      const request = await ctx.$api.pages.getNewsPage(ctx.route.query)
      const response = await request.data
      return { response }
    } catch (e) {
      ctx.error(e)
    }
  },
  data() {
    return {
      years: [],
      currentDate: new Date(),
      totalItems: null,
      items: null,
      isLoading: true,
      filters: {
        direction: undefined,
        month: undefined,
        year: undefined,
        page: undefined,
      },
    }
  },
  beforeMount() {
    for (let i = 0; i < 10; i++) {
      this.years.push(this.currentDate.getFullYear() - i)
    }
  },
  mounted() {
    this.filters.year = this.$route.query?.year
    this.filters.page = this.$route.query?.page
      ? +this.$route.query?.page
      : this.locale.currentPage
    this.items = this.locale.items
    this.totalItems = this.locale?.total
    this.isLoading = false
  },

  computed: {
    ...mapState(['lang']),
    ...mapGetters(['isDesktop', 'isMobile']),
    locale() {
      return this.response[0][this.lang]
    },
    titleClass() {
      if (this.isMobile) return 'text-h3'
      if (this.isDesktop) return 'text-h2'
      return 'text-h1'
    },
    descClass() {
      if (this.isMobile || this.isDesktop) return 'text-p2'
      return 'text-p1'
    },
    titleDirection() {
      return this.$route.query.direction
        ? this.locale?.filters[0]?.tags.filter(
            (el) => el.id === +this.$route.query.direction,
          )[0]?.text
        : this.locale?.filters[0]?.title
    },
    titleMonth() {
      return this.$route.query.month
        ? this.locale?.filters[1]?.months[this.$route.query.month - 1]
        : this.locale?.filters[1]?.title
    },
    swiperOptions() {
      return {
        slidesPerView: 1,
        speed: 400,
        initialSlide: this.years.indexOf(
          +(this.$route.query.year
            ? this.$route.query.year
            : this.currentDate.getFullYear()),
        ),
      }
    },
  },
  watch: {
    isHeaderSticky(newV) {
      document.querySelector('.header').classList.add('no-shadow')
      if (!newV) this.$refs.sticky.classList.remove('sticky')
      else {
        setTimeout(() => {
          this.$refs.sticky.classList.add('sticky')
        }, 300)
      }
    },
  },

  methods: {
    disable(idx) {
      return (
        idx > this.currentDate.getMonth() &&
        (!this.filters.year ||
          this.filters.year === this.currentDate.getFullYear())
      )
    },
    async changeQuery(query, val) {
      try {
        if (query !== 'page') {
          this.filters.page = 1
        }
        this.isLoading = true
        this.filters[query] = val
        this.$router.push({ query: this.filters })
        const request = await this.$api.pages.getNewsPage(this.filters)
        const newLocale = request.data[0][this.lang]
        this.items = newLocale.items
        this.filters.page = newLocale.currentPage
        this.totalItems = newLocale.total
        this.isLoading = false
      } catch (e) {
        this.$nuxt.error(e)
      }
    },
    changePage(num) {
      if (num !== this.filters.page) {
        this.changeQuery('page', num)
      }
    },
  },
}
</script>

<style lang="scss">
.news {
  @for $i from 1 through 100 {
    .articles-order:nth-child(#{$i}) {
      order: $i;
      @include only-tablet {
        &.news-paper {
          order: calc(#{$i} + 1);
          & + .articles-order {
            order: calc(#{$i} - 1);
          }
        }
      }
    }
  }
  .disable {
    color: $COLOR_GREY;
    pointer-events: none;
  }
  .error-text {
    @include tablet {
      margin-bottom: 5rem;
    }
    @include desktop {
      margin-bottom: 10rem;
    }
  }
  h1.text-h1 {
    width: 100%;
    border: $BORDER_DEFAULT;
    border-bottom-color: transparent;
    padding: 3rem;
    margin-bottom: 1rem;
  }

  .wrapper {
    width: 100%;
    margin-bottom: 3.4rem;
    padding-top: 2rem;
  }

  .sub-sticky {
    display: flex;

    .custom-select {
      &:not(:last-of-type) {
        margin-right: 2rem;
      }
    }
  }

  .news__filter {
    @include dropdown-content;
    min-width: 16rem;
    .hr {
      margin-bottom: 2rem;
    }
    .year-li {
      &:not(:last-of-type) {
        margin-bottom: 1rem;
      }
    }
    button {
      text-transform: lowercase;
    }
  }

  &__articles {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-bottom: 7rem;
    .row {
      width: 100%;
    }
    .col-6 {
      margin-bottom: 3rem;
    }
  }

  &-paper {
    border-top: $BORDER_DEFAULT;
    border-bottom: $BORDER_DEFAULT;

    &.col-6 {
      padding: 1.5rem var(--col-gap) !important;
    }

    &__wrapper {
      display: flex;
    }

    img {
      object-fit: cover;
      width: 10.5rem;
      margin-right: 1.5rem;
    }

    &__text {
      width: 100%;
      h2 {
        margin-bottom: 1rem;
      }

      .custom-link__words {
        display: none;
      }
      svg {
        margin-left: 0 !important;
      }
      .topic {
        display: none;
      }
      footer {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        p {
          margin-bottom: 3.6rem;
        }
      }
    }
  }

  .pagination {
    margin-bottom: 6rem;
  }
  .rules-wrapper {
    display: flex;
    justify-content: center;
    .rules {
      text-decoration: underline;
      text-underline-offset: 0.5rem;
    }
  }

  @include tablet {
    h1.text-h1 {
      padding: 4rem;
      margin-bottom: 2rem;
    }

    &__articles {
      margin-bottom: 3rem;
      .col-6 {
        margin-bottom: 4rem;
      }
    }

    &-paper {
      img {
        width: 9rem;
        margin-right: 3rem;
      }

      &.col-6 {
        padding: 3rem var(--col-gap) !important;
      }

      footer {
        flex-direction: row;
        p {
          margin-bottom: 0;
        }
      }

      .custom-link__words {
        display: block;
      }
      svg {
        top: 0 !important;
      }

      &__text {
        .topic {
          display: block;
          margin-bottom: 5rem;
        }
      }
    }

    .pagination {
      margin-bottom: 7rem;
    }
  }

  @include desktop {
    h1.text-h1 {
      padding: 5rem;
      margin-bottom: 3rem;
    }

    .wrapper {
      padding-top: 3rem;
      margin-bottom: 8.4rem;
    }

    &__articles {
      margin-bottom: 0;
      .col-6 {
        margin-bottom: 7rem;
      }
    }
    &-paper {
      img {
        width: 11.5rem;
        margin-right: 7rem;
      }

      &.col-6 {
        padding: 3.8rem var(--col-gap) !important;
      }

      .topic {
        margin-bottom: 6rem;
      }
    }

    .pagination {
      margin-bottom: 10rem;
    }
  }
}
.news-filtered {
  .sticky-wrapper {
    display: flex;
  }
  &.sticky {
    @include sticky;
    .sticky-wrapper {
      padding-top: 1.6rem;
      border-top: 1px solid #e9ecf1;
      .custom-select {
        padding-top: unset;
        border-top: unset;
      }
    }
  }
  .custom-select__items {
    right: unset;
  }
}
</style>

<template>
  <main class="search-page">
    <div class="container">
      <header v-if="categories">
        <button
          v-for="item in categories"
          :key="item?.key"
          class="categorie"
          :class="[
            isDesktop ? 'text-p2' : 'text-p1',
            { active: activeFilter === item?.key },
          ]"
          @click="activeFilter = item?.key"
        >
          {{ item?.text }} ({{ item?.count }})
        </button>
      </header>
      <ul v-if="filteredContent?.length" class="search-page__results">
        <li v-for="(item, i) in filteredContent" :key="$keyGen(i)">
          <nuxt-link
            v-for="(post, c) in item?.items || []"
            :key="c"
            class="article"
            :to="post?.link"
          >
            <div v-if="item?.name || post?.date" class="result-date text-p2">
              <p v-if="item?.name">{{ item?.name }}</p>
              <p v-if="post?.date" class="search-page__date">
                {{ $dateConverter(post?.date) }}
              </p>
            </div>
            <div class="result-img" :class="{ 'no-image': !post?.image }">
              <img
                v-if="post?.image"
                :src="storageUrl + post?.image"
                :alt="post?.title"
              />
            </div>
            <div v-if="post?.title || post?.text" class="result-desc">
              <p v-if="post?.title" :class="isMobile ? 'text-p1' : 'text-h3'">
                {{ post?.title }}
              </p>
              <p
                v-if="post?.text"
                class="text-p2 result-desc-text"
                v-html="post?.text"
              />
            </div>
          </nuxt-link>
        </li>
      </ul>
      <div v-else class="no-content">
        <p :class="isDesktop ? 'text-p1' : 'text-p2'">
          {{ emptyText }}
        </p>
        <ul>
          <li
            v-for="(item, i) in $options?.links?.items || []"
            :key="$keyGen(i)"
          >
            <nuxt-link :to="item.href">
              <p class="text-h3">
                {{ item?.title }}
              </p>
              <span>
                <span
                  v-if="!isMobile"
                  :class="isDesktop ? 'text-p2' : 'text-p1'"
                  >{{ $options?.links?.button }}</span
                >
                <inline-svg
                  :src="$getDefault('img', 'DEFAULT_ICON_ARROW_LINK')"
                />
              </span>
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  links: {
    button: 'перейти',
    items: [
      { title: 'проекты', href: '/projects' },
      { title: 'школа', href: '/school' },
      { title: 'новости', href: '/news' },
      { title: 'ответственность', href: '/csr' },
    ],
  },
  name: 'Search',
  inject: ['storageUrl'],
  async asyncData(ctx) {
    try {
      const request = await ctx.$api.pages.getSearchPage(ctx.route.query.search)
      const response = request?.data
      return { response }
    } catch (e) {
      ctx.error(e)
    }
  },
  data() {
    return {
      categories: null,
      content: null,
      activeFilter: 'all',
    }
  },
  mounted() {
    this.setHeaderSticky(false)
    this.categories = this.response?.categories
    this.content = this.response?.content
  },
  beforeDestroy() {
    this.$nuxt.$emit('openSearchBar')
  },
  computed: {
    ...mapState(['lang']),
    ...mapGetters(['isDesktop', 'isMobile']),
    emptyText() {
      return this.lang === 'ru'
        ? 'Ничего не найдено, попробуйте другой запрос'
        : 'Nothing found, try another query'
    },
    filteredContent() {
      return this.activeFilter !== 'all'
        ? this.content?.filter((item) => item.key === this.activeFilter)
        : this.content
    },
  },
  methods: {
    ...mapMutations(['setHeaderSticky']),
  },
  watch: {
    async '$route.query.search'() {
      const request = await this.$api.pages.getSearchPage(
        this.$route.query.search,
      )
      const response = request.data
      this.categories = response?.categories
      this.content = response?.content
    },
  },
}
</script>

<style lang="scss">
html {
  --content-position-top: 23rem;
  @include desktop {
    --content-position-top: 29rem;
  }
}
.search-page {
  .categorie {
    white-space: nowrap;
    &.active {
      pointer-events: none;
    }
    &:not(.active) {
      color: $COLOR_GREY-BLUE;
      &:hover {
        color: $COLOR_BLACK-BLUE;
      }
    }
    &:not(:first-child) {
      margin-left: 2rem;
    }
  }
  .no-content {
    width: 100%;
    ul {
      margin-top: 9rem;
      li {
        a {
          @include a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 2rem;
          border-bottom: $BORDER_DEFAULT;
          margin-bottom: 2rem;
          svg {
            width: 4.1rem;
            height: 1.6rem;
          }
        }
      }
    }
  }
  &.content {
    //min-height: 100vh;
    z-index: 0;
  }

  header {
    overflow-y: scroll;
    width: 100%;
    display: flex;
    padding-bottom: 1rem;
    margin-bottom: 3rem;
    @include tablet {
      margin-bottom: 6rem;
    }
  }

  &__results {
    width: 100%;
    li {
      &:last-child {
        .article:last-child {
          border-bottom: unset;
        }
      }
      &:not(:first-child) {
        margin-top: 3rem;
      }
      .article {
        display: grid;
        padding-bottom: 3rem;
        border-bottom: $BORDER_DEFAULT;
        &:not(:last-of-type) {
          margin-bottom: 3rem;
        }
        .result-date {
          margin-bottom: 2rem;
        }
        .result-desc-text {
          margin-top: 1rem;
          color: $COLOR_GREY-BLUE;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -moz-box;
          -moz-box-orient: vertical;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          line-clamp: 4;
          box-orient: vertical;
          @include tablet {
            margin-top: 2rem;
          }
        }
        .result-img {
          &.no-image {
            display: none;
            height: 0;
            @include tablet {
              display: block;
            }
          }
          height: 25rem;
          width: 34rem;
          margin-bottom: 2rem;
          img {
            width: 100%;
            object-fit: cover;
            height: 100%;
            border-radius: 3rem;
          }
        }
      }
    }
  }

  &__date {
    color: $COLOR_GREY-BLUE;
  }

  @include tablet {
    margin-bottom: 7rem;
    .no-content {
      ul {
        margin-top: 25.4rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 22rem 22rem;
        grid-row-gap: 2rem;
        li {
          height: 100%;
          &:nth-child(odd) {
            border-right: $BORDER_DEFAULT;
          }
          a {
            height: inherit;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 3rem 3rem 0;
            border-bottom: none;
            border-top: $BORDER_DEFAULT;
            margin-bottom: 0;

            & > span {
              display: flex;
              align-items: center;
              align-self: flex-end;
              svg {
                margin-left: 1rem;
              }
            }
          }
        }
      }
    }

    &__results {
      li {
        .article {
          grid-template-areas: 'date desc img';
          grid-template-columns: 100%/6 100%/2 100%/3;
          grid-column-gap: 4rem;

          .result-date {
            grid-area: date;
            margin-bottom: unset;
          }

          .result-desc {
            grid-area: desc;
          }

          .result-img {
            grid-area: img;
          }
          .result-img {
            height: 14.6rem;
            width: 20.3rem;
            margin-bottom: unset;
          }
        }
      }
    }
  }

  @include desktop {
    .no-content {
      ul {
        margin-top: 11.5rem;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: 27rem;
        grid-row-gap: 0;
        li {
          &:not(:last-of-type) {
            border-right: $BORDER_DEFAULT;
          }
          a {
            padding: 3rem 3rem 0;
          }
        }
      }
    }

    &__results {
      --grid-col: calc(100% / 12);
      li {
        .article {
          grid-template-columns:
            calc(var(--grid-col) * 3) calc(var(--grid-col) * 5)
            calc(var(--grid-col) * 2);
          justify-content: space-between;

          .result-img {
            width: 19rem;
            height: 19rem;
          }
        }
      }
    }
  }
}
</style>

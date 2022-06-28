<template>
  <main id="post" class="post">
    <PageWithIdTitle
      :title="locale?.header?.title"
      :img="locale?.header?.img?.href"
    >
      <template #header>
        <custom-link
          :text="locale?.header?.link?.text"
          :text-class="isDesktop ? 'text-h3' : 'text-p1'"
          :to="locale?.header?.link?.href"
        />
      </template>
      <template #footer>
        <footer :class="isDesktop ? 'text-p2' : 'text-p1'">
          <p>
            {{
              $dateConverter(locale?.header?.date, $options?.dateOptions, lang)
            }}
          </p>
          <div>
            <Link
              v-if="
                locale?.header?.download?.text && locale?.header?.download?.href
              "
              :to="storageUrl + locale?.header?.download?.href"
            >
              <span>
                {{ locale?.header?.download?.text }}
              </span>
              <inline-svg
                class="i-download"
                :src="$getDefault('img', 'DEFAULT_ICON_DOWNLOAD')"
              />
            </Link>
            <custom-select
              v-if="locale?.header?.select?.title && dropDownLinks"
              :title="locale?.header?.select?.title"
            >
              <ul class="text-p2">
                <li v-for="(item, i) in dropDownLinks" :key="$keyGen(i)">
                  <Link :to="item?.href">
                    <span> {{ item?.text }} </span>
                    <span v-if="item?.key" class="svg-wrapper">
                      <svg-icon class="social" :name="'socials/' + item?.key" />
                    </span>
                  </Link>
                </li>
                <li v-if="locale?.header?.select?.copyLink" class="copy-link">
                  <button @click="copyLink">
                    <span> {{ locale?.header?.select?.copyLink }} </span>
                    <inline-svg
                      class="copy-img"
                      :src="$getDefault('img', 'DEFAULT_ICON_COPY')"
                    />
                  </button>
                  <transition name="fade">
                    <span v-if="showText">- {{ copyText }}</span>
                  </transition>
                </li>
              </ul>
            </custom-select>
          </div>
        </footer>
      </template>
      <template #imgDesc>
        <div
          class="page-title-img-desc text-p2"
          v-html="locale?.header?.img?.desc"
        />
      </template>
    </PageWithIdTitle>

    <w-content
      :table="locale?.table"
      :slider="locale?.psingle3"
      :image-block="locale?.image_block"
      :video-block="locale?.video_block"
      :files="locale?.files"
      :statistic="locale?.psingle2"
      :important-info="locale?.important_information"
      :lists="locale?.lists"
      :comment="locale?.comment"
      :header="locale?.psingle1"
    />

    <ImgSlider
      v-if="locale?.slider"
      :images="locale?.slider?.map((el) => el.img)"
      :desc="locale?.slider?.map((el) => el.text)"
    />

    <div
      v-if="locale?.tags?.items?.length"
      class="post__tags container"
      :class="isDesktop ? 'text-p2' : 'text-p1'"
    >
      <ul>
        <li v-for="(item, i) in locale?.tags?.items" :key="$keyGen(i)">
          #{{ item?.text }}
        </li>
      </ul>
      <div
        class="links"
        :class="{
          haveDownload: !(
            locale?.tags?.download?.text && locale?.tags?.download?.href
          ),
        }"
      >
        <Link
          v-if="locale?.tags?.download?.text && locale?.tags?.download?.href"
          class="links__download"
          :to="storageUrl + locale?.tags?.download?.href"
        >
          {{ locale?.tags?.download?.text }}
          <inline-svg :src="$getDefault('img', 'DEFAULT_ICON_DOWNLOAD')" />
        </Link>
        <custom-select
          v-if="locale?.header?.select?.title && locale?.header?.select?.items"
          :title="locale?.header?.select?.title"
          :button-class="isDesktop ? 'text-p2' : 'text-p1'"
        >
          <ul class="tags-select">
            <li
              v-for="(item, i) in locale?.header?.select?.items"
              :key="$keyGen(i)"
            >
              <Link :to="item?.href">
                <span> {{ item?.text }} </span>
                <span v-if="item?.key" class="svg-wrapper">
                  <svg-icon class="social" :name="'socials/' + item?.key" />
                </span>
              </Link>
            </li>
            <li v-if="locale?.header?.select?.copyLink" class="copy-link">
              <button @click="copyLink">
                <span> {{ locale?.header?.select?.copyLink }} </span>
                <span class="svg-wrapper">
                  <inline-svg :src="$getDefault('img', 'DEFAULT_ICON_COPY')" />
                </span>
              </button>
              <transition name="fade">
                <span v-if="showText">- {{ copyText }}</span>
              </transition>
            </li>
          </ul>
        </custom-select>
      </div>
    </div>

    <ContentSlider
      :title="locale?.news?.title"
      :link="locale?.news?.link"
      :items="locale?.news?.items"
    />
  </main>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import WContent from '../../components/wysiwyg/wContent'
import Link from '~/components/custom/Link'
import CustomSelect from '~/components/custom/CustomSelect.vue'
import CustomLink from '~/components/custom/CustomLink.vue'
import ContentSlider from '~/components/blocks/ContentSlider'
import ImgSlider from '~/components/blocks/ImgSlider'
import PageWithIdTitle from '~/components/blocks/PageWithIdTitle'
import seoMixin from '~/mixins/seoMixin'

export default {
  dateOptions: {
    day: 'numeric',
    month: 'long',
  },
  name: 'Post',
  components: {
    WContent,
    Link,
    PageWithIdTitle,
    ImgSlider,
    ContentSlider,
    CustomLink,
    CustomSelect,
  },
  mixins: [seoMixin],
  inject: ['storageUrl'],
  async asyncData(ctx) {
    try {
      const request = await ctx.$api.pages.getNewsByIdPage(ctx.route.params.id)
      const response = await request.data
      return { response }
    } catch (e) {
      ctx.error(e)
    }
  },
  data() {
    return {
      showText: false,
    }
  },
  computed: {
    ...mapState(['lang']),
    ...mapGetters(['isDesktop']),
    locale() {
      return this.response[this.lang]
    },
    copyText() {
      return this.lang === 'ru' ? 'скопировано' : 'copied'
    },
    dropDownLinks() {
      const areLinksDefined = Array.isArray(this.locale.header?.select?.items)
      return (
        areLinksDefined &&
        this.locale?.header?.select?.items?.filter((el) => el.href && el.text)
      )
    },
  },
  methods: {
    copyLink() {
      this.showText = true
      navigator.clipboard?.writeText(window.location.href)
      setTimeout(() => {
        this.showText = false
      }, 2000)
    },
  },
}
</script>

<style lang="scss">
.post {
  .copy-img {
    margin-left: 1rem;
    width: 2rem;
    height: 2rem;
  }
  .page-title-img-desc {
    color: $COLOR_GREY-BLUE;
  }
  .page-with-id-title {
    header {
      padding-bottom: 0;
    }

    footer {
      flex-direction: column;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;

      p {
        margin-bottom: 3rem;
      }

      & > div {
        &.haveDownload {
          justify-content: flex-end;
        }
        display: flex;
        align-items: center;
        justify-content: space-between;

        & > a {
          @include flex-center;
          margin-bottom: 0;
        }

        span {
          white-space: nowrap;
        }

        .i-download {
          width: 2.5rem;
          margin-left: 1rem;
        }
      }
    }
  }

  &__tags {
    margin-top: 6rem;
    padding: 2rem 0 2.5rem;
    border-top: $BORDER_DEFAULT;
    border-bottom: $BORDER_DEFAULT;
    margin-bottom: 6rem;

    ul {
      flex-wrap: wrap;
      display: flex;
      gap: 1rem;
      margin-bottom: 4rem;
    }

    a,
    button {
      display: inline-flex;
    }

    svg {
      margin-left: 1.4rem;
    }

    .links {
      &.haveDownload {
        justify-content: flex-end;
      }
      align-items: flex-start;
      display: flex;
      justify-content: space-between;
      height: fit-content;
      &__download {
        width: max-content;
        svg {
          width: 2.5rem;
          height: 2.5rem;
        }
      }
    }
  }

  @include tablet {
    .page-with-id-title {
      header {
        padding-bottom: 0.5rem;
      }

      footer {
        flex-direction: row;

        p {
          margin-bottom: 0;
        }

        & > div {
          & > a {
            margin-right: 3rem;
          }
        }
      }
    }

    &__tags {
      margin-top: 10rem;
      margin-bottom: 5rem;

      ul {
        margin-bottom: 8rem;
      }
    }
  }

  @include desktop {
    &__tags {
      display: flex;
      justify-content: space-between;
      padding: 3rem 0 3.5rem;
      margin-bottom: 8rem;

      ul {
        margin-bottom: 0;
      }

      .links__download {
        margin-right: 2rem;
      }
    }
  }

  .custom-select {
    position: relative;

    &__items {
      right: 0;
    }

    ul {
      @include dropdown-content;
      width: 27.6rem;
      padding: 4rem;

      li {
        a,
        button {
          text-align: start;
          @include flex-center;
          justify-content: space-between;

          .svg-wrapper {
            @include flex-center;
            width: 2rem;
            height: 2rem;
            margin-left: 1rem;
          }
        }

        &.copy-link {
          margin-top: 3.8rem;

          &:first-child {
            margin-top: 0;
          }
        }
      }
    }

    .tags-select {
      display: block;

      .copy-link {
        span {
          white-space: nowrap;
        }
      }

      li {
        a,
        button {
          .svg-wrapper {
            svg {
              margin-left: 0;
            }
          }
        }
      }
    }
  }
}
</style>

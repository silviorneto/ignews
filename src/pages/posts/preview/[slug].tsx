import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { RichText } from "prismic-dom";
import { prismic_api } from "../../../services/prismic";

import styles from "../post.module.scss";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview ({ post }: PostPreviewProps) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a href="">Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { slug: 'saas-single-tenant-ou-multi-tenant-qual-escolher'} }
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({
  params,
}) => {
  const { slug } = params;

  const response = await prismic_api.get(
    `/documents/search?ref=${process.env.PRISMIC_REF}&access_token=${
      process.env.PRISMIC_ACCESS_TOKEN
    }&pageSize=100&q=%5B%5Bat(my.post.uid%2C"${String(slug)}")%5D%5D`
  );

  const post = {
    slug: response.data.results[0].slugs[0],
    title: RichText.asText(response.data.results[0].data.title),
    content: RichText.asHtml(response.data.results[0].data.content.splice(0, 3)),
    updatedAt: new Date(
      response.data.results[0].last_publication_date
    ).toLocaleDateString("pt-br", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutes
  };
};

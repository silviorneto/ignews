import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { RichText } from "prismic-dom";
import { prismic_api } from "../../services/prismic";

import styles from "./post.module.scss";
interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function Post({ post }: PostProps) {
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
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const session = await getSession({ req });
  const { slug } = params;

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: `/posts/preview/${slug}`,
        permanent: false,
      },
    };
  }

  const response = await prismic_api.get(
    `/documents/search?ref=${process.env.PRISMIC_REF}&access_token=${
      process.env.PRISMIC_ACCESS_TOKEN
    }&pageSize=100&q=%5B%5Bat(my.post.uid%2C"${String(slug)}")%5D%5D`
  );

  const post = {
    slug: response.data.results[0].slugs[0],
    title: RichText.asText(response.data.results[0].data.title),
    content: RichText.asHtml(response.data.results[0].data.content),
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
  };
};

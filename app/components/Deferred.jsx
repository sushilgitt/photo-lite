import { Suspense } from "react";
import { Await } from "react-router";
import { Page, Layout, Card, BlockStack, SkeletonBodyText, SkeletonDisplayText, Banner } from "@shopify/polaris";

// Renders a page whose heavy data (the product catalog) streams in after
// navigation. The header shows immediately with a skeleton below it, so moving
// between pages never waits on a whole-catalog fetch.
export default function Deferred({ resolve, header, children }) {
  const shell = (body) => (
    <Page>
      <Layout>
        <Layout.Section>{header}</Layout.Section>
        <Layout.Section>{body}</Layout.Section>
      </Layout>
    </Page>
  );

  return (
    <Suspense
      fallback={shell(
        <Card>
          <BlockStack gap="400">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={10} />
          </BlockStack>
        </Card>
      )}
    >
      <Await
        resolve={resolve}
        errorElement={shell(
          <Banner title="Something went wrong" tone="critical">
            Could not load your products. Please refresh to try again.
          </Banner>
        )}
      >
        {children}
      </Await>
    </Suspense>
  );
}

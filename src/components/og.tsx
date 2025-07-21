import type { ComponentChildren } from "preact";

export { IndexOG, ExampleOG };

interface BaseOgLayoutProps {
  topLeft?: ComponentChildren;
  topRight?: ComponentChildren;
  main?: ComponentChildren;
  sub?: ComponentChildren;
  bottomLeft?: ComponentChildren;
  bottomRight?: ComponentChildren;
}

function BaseOgLayout({
  topLeft,
  topRight,
  main,
  sub,
  bottomLeft,
  bottomRight,
}: BaseOgLayoutProps) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#ffffff",
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
        backgroundSize: "20px 20px",
        padding: "60px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {topLeft}
        {topRight}
      </div>

      {/* Main content section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {main}
        {sub}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {bottomLeft}
        {bottomRight}
      </div>
    </div>
  );
}

function IndexOG() {
  return (
    <BaseOgLayout
      main={
        <h2
          style={{
            fontSize: "72px",
            fontFamily: "Inter Bold",
            color: "#000000",
            lineHeight: "1.1",
            margin: "0",
            textAlign: "center",
          }}
        >
          Effect by Example
        </h2>
      }
      sub={
        <p
          style={{
            fontSize: "28px",
            color: "#666666",
            margin: "0",
            textAlign: "center",
            lineHeight: "1.3",
          }}
        >
          A curated set of high quality snippets with explanations for Effect
        </p>
      }
      bottomRight={
        <div
          style={{
            width: "100px",
            height: "4px",
            backgroundColor: "#000000",
            transform: "skew(-10deg)",
          }}
        />
      }
    />
  );
}

interface ExampleOGProps {
  title: string;
  tags: string[];
}

function ExampleOG({ title, tags }: ExampleOGProps) {
  return (
    <BaseOgLayout
      main={
        <h2
          style={{
            fontSize: "72px",
            fontFamily: "Inter Bold",
            color: "#000000",
            lineHeight: "1.1",
            margin: "0",
            textAlign: "left",
          }}
        >
          Effect by Example: {title}
        </h2>
      }
      sub={
        <p
          style={{
            fontSize: "28px",
            color: "#666666",
            margin: "0",
            textAlign: "left",
            lineHeight: "1.3",
          }}
        >
          A curated set of high quality snippets with explanations for Effect
        </p>
      }
      bottomLeft={
        tags &&
        tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    padding: "8px 16px",
                    fontSize: "20px",
                    fontWeight: "500",
                    borderRadius: "20px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )
      }
      bottomRight={
        <div
          style={{
            width: "100px",
            height: "4px",
            backgroundColor: "#000000",
            transform: "skew(-10deg)",
          }}
        />
      }
    />
  );
}

type OGProps =
  | {
      variant: "index";
    }
  | { variant: "example"; title: string; tags: string[] };

export default function OG(props: OGProps): any {
  if (props.variant === "index") {
    return <IndexOG />;
  }

  return <ExampleOG title={props.title} tags={props.tags} />;
}

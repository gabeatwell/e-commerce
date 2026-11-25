import { ImageResponse } from "@vercel/og";

const h = (type, props, ...children) => ({
    type,
    props: props || {},
    children: children.flat().filter((c) => c != null && c !== ""),
});

export const config = {
    runtime: "edge",
};

export default function handler(req) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Premium Products Store";
    const price = searchParams.get("price") || "";
    const category = searchParams.get("category") || "";

    const children = [
        h(
            "div",
            {
                style: {
                    fontSize: 40,
                    fontWeight: 800,
                    color: "#818cf8",
                    marginBottom: 20,
                },
            },
            "Premium Products Store",
        ),
        h(
            "div",
            {
                style: {
                    fontSize: 52,
                    fontWeight: 700,
                    textAlign: "center",
                    lineHeight: 1.2,
                },
            },
            title,
        ),
    ];

    if (price) {
        children.push(
            h(
                "div",
                {
                    style: {
                        fontSize: 38,
                        color: "#34d399",
                        marginTop: 24,
                        fontWeight: 600,
                    },
                },
                `$${price}`,
            ),
        );
    }

    if (category) {
        children.push(
            h(
                "div",
                {
                    style: {
                        fontSize: 24,
                        color: "#a5b4fc",
                        marginTop: 12,
                        textTransform: "uppercase",
                        letterSpacing: 3,
                    },
                },
                category,
            ),
        );
    }

    const element = h(
        "div",
        {
            style: {
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#1e1b4b",
                color: "white",
                padding: "60px",
                fontFamily: "sans-serif",
            },
        },
        ...children,
    );

    return new ImageResponse(element, {
        width: 1200,
        height: 630,
    });
}

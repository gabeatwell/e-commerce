import { ImageResponse } from "@vercel/og";

export const config = {
    runtime: "nodejs",
};

const h = (type, props, ...children) => ({
    type,
    props: props || {},
    children: children.flat().filter((c) => c != null && c !== ""),
});

export default async function handler(req, res) {
    try {
        const url = new URL(`http://localhost${req.url}`);
        const title = url.searchParams.get("title") || "Premium Products Store";
        const price = url.searchParams.get("price") || "";
        const category = url.searchParams.get("category") || "";

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

        const imageResponse = new ImageResponse(element, {
            width: 1200,
            height: 630,
        });

        const arrayBuffer = await imageResponse.arrayBuffer();

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error("OG image error:", error);
        res.status(500).json({ error: error.message });
    }
}

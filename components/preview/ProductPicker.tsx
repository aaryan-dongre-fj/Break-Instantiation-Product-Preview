"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FlowToolProduct } from "@/utils/flowTool";
import { slugForProduct } from "@/utils/productSlug";
import { useCompanyHref } from "@/components/CompanyProvider";

export default function ProductPicker({
  products,
}: {
  products: FlowToolProduct[];
}) {
  const [query, setQuery] = useState("");

  const ordered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products
      .filter(
        (product) =>
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.code.toLowerCase().includes(term)
      )
      .slice()
      .sort((a, b) => {
        if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [products, query]);

  return (
    <div className="space-y-8">
      {products.length > 6 ? (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter products"
            className="h-11 rounded-full border-neutral bg-transparent pl-10 text-primary-text placeholder:text-neutral focus-visible:border-secondary-background focus-visible:ring-1 focus-visible:ring-secondary-background"
          />
        </div>
      ) : null}

      {ordered.length === 0 ? (
        <p className="text-primary-text/50">No products match “{query}”.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ordered.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4) }}
            >
              <ProductCard
                product={product}
                slug={slugForProduct(product, products)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  slug,
}: {
  product: FlowToolProduct;
  slug: string;
}) {
  const published = Boolean(product.active_version_id);
  const companyHref = useCompanyHref();

  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h2 className="text-xl font-bold leading-tight tracking-tight">{product.name}</h2>
          <p className="font-mono text-xs tracking-wide text-primary-text/40">
            {product.code}
          </p>
        </div>
        {product.is_default ? (
          <span className="shrink-0 rounded-full bg-secondary-background/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-secondary-background">
            Default
          </span>
        ) : null}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-primary-text/10 pt-5">
        {published ? (
          <>
            <span className="text-sm text-primary-text/50">
              <span className="font-medium text-primary-text">
                Latest Version
              </span>
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-primary-text transition-transform group-hover:translate-x-0.5">
              Start
              <ArrowRight className="h-4 w-4" />
            </span>
          </>
        ) : (
          <span className="text-sm text-primary-text/40">
            Not available yet
          </span>
        )}
      </div>
    </>
  );

  if (!published) {
    return (
      <div className="h-full cursor-not-allowed rounded-card border border-dashed border-[var(--ej-border-strong)] bg-transparent p-6 opacity-60">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={companyHref(`/preview/${slug}`)}
      className="group dossier-card block h-full rounded-card p-6 transition-colors hover:border-[var(--ej-border-active)]"
    >
      {body}
    </Link>
  );
}

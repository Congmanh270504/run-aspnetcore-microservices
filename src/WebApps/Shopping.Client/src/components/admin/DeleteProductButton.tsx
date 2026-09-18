"use client";

import React, { useState } from "react";
import { deleteProduct } from "@/actions/catalogActions";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteProduct(productId);
      } catch (err) {
        console.error("Failed to delete product:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs gap-1"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      <span>Delete</span>
    </Button>
  );
}


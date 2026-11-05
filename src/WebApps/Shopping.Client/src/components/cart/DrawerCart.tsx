"use client";

import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { ArrowRightIcon, ShoppingBag, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";

type CartItem = {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
};

interface DrawerCartProps {
    items?: CartItem[];
}

const defaultItems: CartItem[] = [
    {
        id: "1",
        name: "Polarised sunglasses",
        description: "Polarized sunglasses with UV protection",
        price: "$199.99",
        image: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/shopping-cart/image-7.png",
    },
    {
        id: "2",
        name: "Lyocell-blend bucket hat",
        description:
            "Bucket hat in woven fabric made from a lyocell and nylon blend.",
        price: "$19",
        image: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/shopping-cart/image-6.png",
    },
    {
        id: "3",
        name: "Regular Fit Polo shirt",
        description: "Regular fit polo shirt in breathable fabric.",
        price: "$29",
        image: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/shopping-cart/image-5.png",
    },
];

const DrawerCart = ({ items = defaultItems }: DrawerCartProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            document.documentElement.classList.add("no-scrollbar");
            document.body.classList.add("no-scrollbar");
        } else {
            document.documentElement.classList.remove("no-scrollbar");
            document.body.classList.remove("no-scrollbar");
        }

        return () => {
            document.documentElement.classList.remove("no-scrollbar");
            document.body.classList.remove("no-scrollbar");
        };
    }, [isOpen]);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    className="relative rounded-lg"
                    size="icon"
                >
                    <ShoppingBag /> <span className="sr-only">Cart</span>
                    <Badge
                        variant="destructive"
                        className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1  text-red-400 bg-red-200 pl-[4.5px]"
                    >
                        8
                    </Badge>
                </Button>
            </DrawerTrigger>
            <DrawerContent className="fixed inset-y-0 m-4 right-0 left-auto h-full bg-transparent w-full sm:w-[420px] border-none flex flex-col">
                <div className="bg-gray-100 rounded-lg h-[98%] overflow-hidden overflow-y-auto no-scrollbar flex flex-col">
                    <DrawerHeader>
                        <DrawerTitle>Cart</DrawerTitle>
                    </DrawerHeader>
                    <div className="no-scrollbar space-y-4 overflow-y-auto px-4 ">
                        {items.map((item, index) => (
                            <div key={item.id}>
                                {index > 0 && (
                                    <Separator
                                        key={`sep-${item.id}`}
                                        className="my-4"
                                    />
                                )}
                                <div key={item.id} className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-18 overflow-hidden rounded-lg border">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h4 className="font-medium">
                                                {item.name}
                                            </h4>
                                            <p className="text-muted-foreground text-sm">
                                                {item.description}
                                            </p>
                                            <p className="font-medium">
                                                {item.price}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 w-full"
                                    >
                                        <Trash2Icon />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="my-4 space-y-2">
                            <div className="flex justify-between">
                                <p className="text-muted-foreground">
                                    Subtotal
                                </p>
                                <p>$247.99</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-muted-foreground">
                                    Shipping
                                </p>
                                <p>$10.00</p>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <p className="font-medium">Total</p>
                                <p className="font-medium">$257.99</p>
                            </div>
                        </div>
                    </div>
                    <DrawerFooter className="mt-auto">
                        <Button>
                            Checkout <ArrowRightIcon />
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Continue Shopping</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default DrawerCart;

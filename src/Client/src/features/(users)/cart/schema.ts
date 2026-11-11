import { z } from "zod";

export const checkoutFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    emailAddress: z.string().email("Invalid email address"),
    addressLine: z.string().min(1, "Street address is required"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State / Province is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    cardName: z.string().min(1, "Name on card is required"),
    cardNumber: z.string().min(1, "Card number is required"),
    expiration: z.string().min(1, "Expiration is required"),
    cvv: z.string().min(1, "CVV is required"),
    paymentMethod: z.number().default(1),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

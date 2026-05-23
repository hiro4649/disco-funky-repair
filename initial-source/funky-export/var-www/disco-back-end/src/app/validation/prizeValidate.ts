import { z } from 'zod';

// Define the Zod schema for prize validation
const prizeSchema = z.object({
    tokenName: z.string().min(3, { message: "Token name must be at least 3 characters long" }),
    symbol: z.string().min(1, { message: "Symbol must not exceed 3 characters" }),
    listed_DEX: z.string().min(2, { message: "Deployed DEX Name must not exceed 3 characters" }),
    ranking: z.number().min(1, { message: "Ranking must be a positive integer" }),
    probability: z.number().min(0, { message: "Probability must be Int" }), // Assuming probability is a decimal between 0 and 1
    real_probability: z.number().min(0, { message: "Real Probaility must be Int"}),
    earned_pts: z.number().min(1, { message: "Earned points must be a non-negative integer" }),
});
export default prizeSchema;
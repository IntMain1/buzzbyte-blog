<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'body' => '<p>' . fake()->paragraphs(3, true) . '</p>',
            'cover_image' => null,
            'user_id' => User::factory(),
        ];
    }
}

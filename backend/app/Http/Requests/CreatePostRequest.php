<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request for creating a post
 * Centralizes validation logic outside the controller
 */
class CreatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'min:10'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120', 'dimensions:max_width=4000,max_height=4000'],
            'tags' => ['required', 'array', 'min:1'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'A post title is required.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'body.required' => 'Post content is required.',
            'body.min' => 'Content must be at least 10 characters.',
            'tags.required' => 'At least one tag is required.',
            'tags.min' => 'At least one tag is required.',
            'tags.*.exists' => 'Selected tag is invalid.',
            'image.max' => 'Image size cannot exceed 5MB.',
        ];
    }
}

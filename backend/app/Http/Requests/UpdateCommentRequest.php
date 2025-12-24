<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateCommentRequest - Comment Update Validation
 * 
 * Extracted from CommentController for clean validation logic.
 * 
 * @author Omar Tarek
 */
class UpdateCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled by Policies in the Controller
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:1000'],
        ];
    }
}

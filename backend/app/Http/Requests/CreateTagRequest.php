<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * CreateTagRequest - Tag Creation Validation
 * 
 * Extracted from TagController for clean validation logic.
 * 
 * @author Omar Tarek
 */
class CreateTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', 'unique:tags,name'],
        ];
    }
}

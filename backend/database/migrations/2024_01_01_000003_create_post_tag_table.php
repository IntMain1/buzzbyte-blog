<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('post_tag', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('post_id');
            $table->unsignedBigInteger('tag_id');
            
            $table->timestamps();
            
            $table->unique(['post_id', 'tag_id']);
            
            $table->foreign('post_id', 'post_tag_post_id_foreign')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('tag_id', 'post_tag_tag_id_foreign')->references('id')->on('tags')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_tag');
    }
};

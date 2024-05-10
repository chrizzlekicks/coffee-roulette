# frozen_string_literal: true

class PasswordResetsController < ApplicationController
  def create
    return head :bad_request if params[:email].blank?

    user = User.find_by_email!(params[:email])

    token = user.generate_token_for(:password_reset)

    render json: { password_reset_token: token }, status: :created
  end
end

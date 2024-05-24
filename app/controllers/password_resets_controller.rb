# frozen_string_literal: true

class PasswordResetsController < ApplicationController
  rescue_from ActiveRecord::RecordInvalid do |error|
    render json: error.message, status: :bad_request
  end

  def create
    return head :bad_request if params[:email].blank?

    user = User.find_by_email!(params[:email])

    token = user.generate_token_for(:password_reset)

    PasswordResetMailer.with(user: user, token: token).reset_link.deliver_now

    head :created
  rescue ActiveRecord::RecordNotFound => e
    render json: e.message, status: :not_found
  end

  def update
    user = User.find_by_token_for!(:password_reset, params[:token])

    user.update!(password_digest: params[:password_digest])

    # perhaps we should clear the session of the user

    head :ok
  rescue ActiveRecord::RecordNotFound => e
    render json: e.message, status: :not_found
  end
end

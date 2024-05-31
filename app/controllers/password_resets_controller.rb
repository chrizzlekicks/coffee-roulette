# frozen_string_literal: true

class PasswordResetsController < ApplicationController
  rescue_from ActiveRecord::RecordInvalid do
    head :bad_request
  end

  def create
    return head :bad_request if params[:email].blank?

    user = User.find_by_email!(params[:email])

    token = user.generate_token_for(:password_reset)

    PasswordResetMailer.with(user: user, token: token).reset_link.deliver_now

    head :created
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  def update
    user = User.find_by_token_for!(:password_reset, params[:token])

    user.update!(password_digest: params[:password_digest])

    log_out

    head :ok
  rescue ActiveRecord::RecordNotFound
    head :not_found
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    head :bad_request
  end
end

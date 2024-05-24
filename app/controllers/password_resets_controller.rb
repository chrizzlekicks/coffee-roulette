# frozen_string_literal: true

class PasswordResetsController < ApplicationController
  def create
    return head :bad_request if params[:email].blank?

    user = User.find_by_email!(params[:email])

    token = user.generate_token_for(:password_reset)

    PasswordResetMailer.with(user: user, token: token).reset_link.deliver_now

    head :created
  end

  def update
    user = User.find_by_token_for!(:password_reset, params[:token])

    user.update!(password_digest: params[:password_digest])

    # perhaps we should clear the session of the user

    head :ok
  end
end

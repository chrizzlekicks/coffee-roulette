# frozen_string_literal: true

class PasswordResetMailer < ApplicationMailer
  default from: 'hello@coffeeroulette.com'

  def reset_link
    @user = params[:user]
    @token = params[:token]

    mail(to: @user.email, subject: 'Here is your password reset link')
  end
end

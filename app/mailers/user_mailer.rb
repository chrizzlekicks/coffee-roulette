# frozen_string_literal: true

class UserMailer < ApplicationMailer
  default from: "hello@coffeeroulette.com"

  def welcome
    @user = params[:user]
    @url = 'https://google.com'
    mail(to: @user.email, subject: 'Welcome')
  end
end

# frozen_string_literal: true

class MatchMailer < ApplicationMailer
  default from: 'hello@coffeeroulette.com'

  def matched
    @user = params[:user]
    @matched_users = params[:matched_users]
    mail(to: @user.email, subject: 'You got matched!')
  end
end

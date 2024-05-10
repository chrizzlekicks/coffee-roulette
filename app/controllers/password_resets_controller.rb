# frozen_string_literal: true

class PasswordResetsController < ApplicationController
  def create
    user = User.find_by_email(params[:email])


  end
end

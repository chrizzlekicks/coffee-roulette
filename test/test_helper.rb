# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

module ActiveSupport
  class TestCase
    include ActionMailer::TestHelper

    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    # fixtures :all

    # Add more helper methods to be used by all tests here...
    def create_session_for(user)
      post '/login', params: { email: user.email, password: user.password }, as: :json
      assert_response :created
      assert_equal 'Session created', response.body
    end

    def logout_session
      delete '/logout'
      assert_response :ok
      assert_equal 'Session closed', response.body
    end

    def stub_multiple_users(count)
      count.times { |i| User.create!(username: "test#{i}", email: "test#{i}@test.de", password: "passwd#{i}") }
    end
  end
end

require 'capybara/rails'
require 'capybara/minitest'

module ActionDispatch
  class IntegrationTest
    include Capybara::DSL
    include Capybara::Minitest::Assertions

    Capybara.current_driver = :selenium

    setup do
      @initial_csrf_token = ActionController::Base.allow_forgery_protection
      ActionController::Base.allow_forgery_protection = true
    end

    teardown do
      Capybara.reset_sessions!
      Capybara.use_default_driver
      ActionController::Base.allow_forgery_protection = @initial_csrf_token
    end
  end
end

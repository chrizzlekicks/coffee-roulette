# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'
require 'capybara/rails'
require 'capybara/minitest'

module ActiveSupport
  class TestCase
    include ActionMailer::TestHelper
    include Capybara::DSL
    include Capybara::Minitest::Assertions

    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    Capybara.current_driver = :selenium

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    # fixtures :all

    teardown do
      Capybara.reset_sessions!
      Capybara.use_default_driver
    end

    # Add more helper methods to be used by all tests here...
    def create_session_for(user)
      post '/login', params: { username: user.username, password: user.password }, as: :json
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
